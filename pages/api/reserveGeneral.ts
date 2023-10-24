import { getLogger } from "@/utils/logging-utils";
import { HttpStatusCode } from "axios";
import _ from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "next-sanity";

const sanityClient = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2023-03-01",
  token:
    "skcEET1oF0tK6FltENUhc87cmaJ3DgMngWVFCbO6UgLz8VieuUI4s817z3vuROMGwuPngGI9GkicV4xqZssf0wRWFRjKsWOHEv4eJzPCPScsncs1Lsnt3KdLTtjQSLfKvSp5fEaOwCthl1l6tAR02VHXRU4fJlG2gCosIsbESvwWxUn357ob",
  useCdn: false, // Disable for authenticated requests
});

const reserveGeneralHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const logger = getLogger("api/reserveGeneral");

  const { name, email, selectedSeats, ticketIds, concertId } = req.body;

  if (!name || !email || !selectedSeats || !ticketIds || !concertId) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "All fields are required" });
    return;
  }

  if (!Array.isArray(selectedSeats)) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Selected seats must be an array" });
    return;
  }

  if (selectedSeats.length === 0) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Selected seats cannot be empty" });
    return;
  }

  if (selectedSeats.length > 10) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Cannot reserve more than 10 seats at a time" });
    return;
  }

  if (!Array.isArray(ticketIds)) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Ticket IDs must be an array" });
    return;
  }

  if (ticketIds.length != selectedSeats.length) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Ticket IDs must match the number of selected seats" });
    return;
  }

  try {
    // Find the customer by name and email
    const query = `*[_type == "customer" && name == $name && email == $email]`;
    const params = { name, email };
    const customers = await sanityClient.fetch(query, params);

    if (customers.length === 0) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "Customer not found" });
      return;
    }

    if (customers.length > 1) {
      res
        .status(HttpStatusCode.InternalServerError)
        .json({ message: "Multiple customers found" });
      return;
    }

    // Found the customer
    const customer = customers[0];
    const customerId = customer._id;

    // Find all the tickets
    const ticketsQuery = `*[_type == "ticket" && _id in $ticketIds]`;
    const ticketsParams = { ticketIds };
    const tickets: Ticket[] = await sanityClient.fetch(
      ticketsQuery,
      ticketsParams
    );

    if (
      tickets.length === 0 ||
      tickets.some((ticket) => !ticket || ticket.number.length !== 9)
    ) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "No valid tickets found" });
      return;
    }

    // Make sure all the tickets belong to the given concert
    if (tickets.some((ticket) => ticket.concert._ref !== concertId)) {
      logger.debug(tickets, "tickets");

      res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "Some tickets do not belong to this concert" });
      return;
    }

    // Make sure all the tickets are not redeemed
    if (tickets.some((ticket) => ticket.redeemed)) {
      res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "Some tickets are already redeemed" });
      return;
    }

    // Make sure none of the tickets are golden tickets
    if (tickets.some((ticket) => ticket.type === "golden")) {
      res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "Some tickets are golden tickets" });
      return;
    }

    // Make sure all the tickets are of the same type (can be either general or silver)
    const ticketTypes = tickets.map((ticket) => ticket.type);
    const ticketType = ticketTypes[0];
    if (ticketTypes.some((type) => type !== ticketType)) {
      res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "Some tickets are not of the same type" });
      return;
    }

    // Make sure all the tickets are consistent with their types
    // The 4th digit must be 8 for silver tickets and 9 for general tickets
    const ticketNumbers = tickets.map((ticket) => ticket.number);
    if (
      ticketType === "general" &&
      ticketNumbers.some((number) => number.toString()[3] !== "9")
    ) {
      res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "Some general tickets are invalid" });
      return;
    }
    if (
      ticketType === "silver" &&
      ticketNumbers.some((number) => number.toString()[3] !== "8")
    ) {
      res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "Some silver tickets are invalid" });
      return;
    }

    // Find the venue
    const concertQuery = `*[_type == "concert" && _id == $concertId]{
      venue -> {
        name,
        _id
      }
    }[0]`;
    const concertParams = { concertId };
    const concert: Concert = await sanityClient.fetch(
      concertQuery,
      concertParams
    );

    if (!concert) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "Concert not found" });
      return;
    }

    const { _id: venueId, name: venueName } = concert.venue;

    // Find the seats
    for (const [seat, ticket] of _.zip(selectedSeats, tickets)) {
      const ticketId = ticket!._id;
      const { sectionName, rowId, seatNumber } = seat;

      const seatQuery = `*[_type == "concert" && _id == $concertId]{
        seatingChart {
          sections[sectionName == $sectionName] {
            rows[id == $rowId] {
              seats[number == $seatNumber] {
                _key
              }
            }
          }
        }
      }[0]`;

      const seatParams = { concertId, sectionName, rowId, seatNumber };
      const seatData = await sanityClient.fetch(seatQuery, seatParams);

      const seatKey =
        seatData?.seatingChart?.sections[0]?.rows[0]?.seats[0]?._key;

      if (!seatKey) {
        res.status(HttpStatusCode.NotFound).json({
          message: `Seat ${rowId}${seatNumber} in section ${sectionName} not found`,
        });
        return;
      }

      // Update the seat to be reserved by the customer
      const updatedSeat = await sanityClient
        .patch(concertId)
        .set({
          [`seatingChart.sections[sectionName==\"${sectionName}\"].rows[id==\"${rowId}\"].seats[_key==\"${seatKey}\"].isReserved`]:
            true,
          [`seatingChart.sections[sectionName==\"${sectionName}\"].rows[id==\"${rowId}\"].seats[_key==\"${seatKey}\"].reservedBy`]:
            {
              _type: "reference",
              _ref: customerId,
            },
          [`seatingChart.sections[sectionName==\"${sectionName}\"].rows[id==\"${rowId}\"].seats[_key==\"${seatKey}\"].redeemedTicket`]:
            {
              _type: "reference",
              _ref: ticketId,
            },
        })
        .commit({
          autoGenerateArrayKeys: true,
        });

      logger.debug(
        updatedSeat.seatingChart.sections
          .find((section: Section) => section.sectionName === sectionName)
          .rows.find((row: Row) => row.id === rowId)
          .seats.find((seat: Seat) => seat._key === seatKey),
        "updatedSeat"
      );

      // Update the ticket to be redeemed, and link to the seat
      // It's not a reference,
      // In the ticket schema, there is a seat object, which is not a reference
      // It's got 4 fields: short, section, row, number. All of them are string
      const short = `${venueName}: ${sectionName}-${rowId}${seatNumber}`;
      const redeemedTicket = await sanityClient
        .patch(ticketId)
        .set({
          redeemed: true,
          seat: {
            short,
            section: sectionName,
            row: rowId,
            number: seatNumber,
            venue: {
              _type: "reference",
              _ref: venueId,
            },
          },
        })
        .commit({ autoGenerateArrayKeys: true });

      logger.debug(redeemedTicket, "redeemedTicket");
    }

    res.status(HttpStatusCode.Ok).json({ success: true });
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export default reserveGeneralHandler;

// Type Definitions
interface Ticket {
  _id: string;
  _type: string;
  type: string;
  number: string;
  redeemed: boolean;
  concert: Concert;
}

interface Customer {
  _id: string;
  _type: string;
  name: string;
  email: string;
  tickets: Ticket[];
}

interface Concert {
  _id: string;
  _type: string;
  _ref?: string;
  name: string;
  date: string;
  seatingChart: SeatingChart;
  venue: Venue;
}

interface Venue {
  _id: string;
  _type: string;
  name: string;
  address: string;
}

interface SeatingChart {
  _type: string;
  sections: Section[];
}

interface Section {
  _type: string;
  sectionName: string;
  rows: Row[];
}

interface Row {
  _type: string;
  id: string;
  seats: Seat[];
}

interface Seat {
  _type: string;
  _key: string;
  number: number;
  isReserved: boolean;
  reservedBy: Customer;
  redeemedTicket: Ticket;
}
