import { Ticket } from "@/models/ticket";
import { HttpStatusCode } from "axios";
import _ from "lodash";
import { createClient } from "next-sanity";
import { toLongSeatString } from "./seating-utils";
import { Concert } from "@/models/concert";
import { Seat } from "@/models/seat";
import { log } from "console";

export const sanityClient = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2022-03-25",
  useCdn: false,
});

export const sanityAdminClient = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2023-03-01",
  token:
    "skHhHg8CnSmPV5G1Zduibkq2PKZ8HEqElBQofLLHNzojqu4n1zR8MBpkjdRbFNZuMvIEodoe2tWG7UkQLsuk6mjDnwHgrcdNlHQKFzPvhBosMLAwulZuyqWb37leLpSvHS9dEMo6Vbvg6rjSamY1J4IxIOMZCMo0PP2XghiyTvQNmV38r6ZH",
  useCdn: false, // Disable for authenticated requests
});

export const redeemTickets = async ({
  tickets,
  selectedSeats,
  concertId,
  name,
  email,
}: {
  tickets: Ticket[];
  selectedSeats: Seat[];
  concertId: string;
  name: string;
  email: string;
}) => {
  // 1. Find the customer by name and email both
  const customersQuery = `*[_type == "customer" && name == $name && email == $email]`;
  const customersParams = { name, email };

  const customers = await sanityClient.fetch(customersQuery, customersParams);

  if (customers.length === 0) {
    return {
      success: false,
      status: HttpStatusCode.NotFound,
      message: `Customer not found`,
    };
  }

  if (customers.length > 1) {
    return {
      success: false,
      status: HttpStatusCode.InternalServerError,
      message: `Multiple customers found. Contact support.`,
    };
  }

  // Found the customer
  const customer = customers[0];
  const customerId = customer._id;

  // 2. Find the venue by concert id
  const concertQuery = `*[_type == "concert" && _id == $concertId]{
      venue -> {
        name,
        _id
      },
      seatingChart -> {
        _id,
      },
    }[0]`;
  const concertParams = { concertId };
  const concert: Concert = await sanityAdminClient.fetch(
    concertQuery,
    concertParams
  );

  if (!concert) {
    return {
      success: false,
      status: HttpStatusCode.NotFound,
      message: `Concert not found`,
    };
  }

  // Go through each selected seat and update the seat to be reserved by the customer
  for (const [ticket, seat] of _.zip(tickets, selectedSeats)) {
    if (!ticket) {
      return {
        success: false,
        status: HttpStatusCode.InternalServerError,
        message: `Ticket not found`,
      };
    }

    if (!seat) {
      return {
        success: false,
        status: HttpStatusCode.InternalServerError,
        message: `Seat not found`,
      };
    }

    const ticketId = ticket._id;

    // TODO Find the seat by seat number
    const { _id: seatId } = seat;

    console.log("seat", seat);

    const seatQuery = `*[_type == "seat" && _id == $seatId]{
      _id,
      _key,
      number,
      isReserved,
      reservedBy -> {
        _id,
        name,
        email
      },
      redeemedTicket -> {
        _id,
        type,
        number,
        redeemed,
        concert -> {
          _id
        },
      },
    }[0]`;
    const seatParams = { seatId };
    const seatData = await sanityAdminClient.fetch(seatQuery, seatParams);

    if (!seatData) {
      return {
        success: false,
        status: HttpStatusCode.NotFound,
        message: `Seat not found`,
      };
    }

    // Update the seat to be reserved by the customer
    const updatedSeat = await sanityAdminClient
      .patch(seatId!)
      .set({
        isReserved: true,
        reservedBy: {
          _type: "reference",
          _ref: customerId,
        },
        redeemedTicket: {
          _type: "reference",
          _ref: ticketId,
        },
      })
      .commit({
        autoGenerateArrayKeys: true,
      });

    if (!updatedSeat) {
      return {
        success: false,
        status: HttpStatusCode.InternalServerError,
        message: `Unable to reserve the Seat ${toLongSeatString(seat)}`,
      };
    }

    // Update the ticket to be redeemed, and link to the seat
    // It's not a reference,
    // In the ticket schema, there is a seat object, which is not a reference
    // It's got 4 fields: short, section, row, number. All of them are string
    const redeemedTicket = await sanityAdminClient
      .patch(ticketId!)
      .set({
        redeemed: true,
        redeemedSeat: {
          _type: "reference",
          _ref: seatId,
        },
      })
      .commit({ autoGenerateArrayKeys: true });

    if (!redeemedTicket) {
      return {
        success: false,
        status: HttpStatusCode.InternalServerError,
        message: `Unable to redeem the ticket ${ticketId}`,
      };
    }
  }
  return {
    success: true,
    status: HttpStatusCode.Ok,
    message: `Tickets redeemed`,
  };
};

export const getConcertsById = async (concertId: string) => {
  const concerts: Concert[] = await sanityClient.fetch(
    `*[_type == "concert" && _id == $concertId]{
      _id,
      name,
      city->{
        name,
        image {
          asset-> {
            url
          }
        },
        _id
      },
      venue->{
        name,
        address,
        _id
      },
      date,
      seatingChart->{
        sections[] {
          name,
          rows[] {
            id,
            seats[]->{
              _id,
              number,
              isReserved,
              isReservable
            }
          },
        },
        referenceImage {
          asset-> {
            url
          }
        },
      },
    }
  `,
    { concertId }
  );

  if (!concerts || concerts.length === 0) {
    return null;
  }

  return concerts[0];
};
