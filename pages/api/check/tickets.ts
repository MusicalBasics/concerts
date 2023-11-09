import { HttpStatusCode } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { sanityAdminClient } from "@/utils/sanity";
import _ from "lodash";

// Initialize the Sanity client
const checkTickets = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, concertId, ticketNumbers } = req.body;

  if (!email || !ticketNumbers || !concertId) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "All fields are required" });
    return;
  }

  if (!Array.isArray(ticketNumbers)) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Ticket numbers must be an array" });
    return;
  }

  if (ticketNumbers.length === 0) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Ticket numbers cannot be empty" });
    return;
  }

  if (ticketNumbers.length > 10) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Cannot check more than 10 tickets at a time" });
    return;
  }

  try {
    // Find the unredeemed tickets by ticket numbers, and make sure they belong to the specified concert

    // It should contain number, concert, pull its _id, and redeemed, also customer
    const ticketsQuery = `*[_type == "ticket" && number in $ticketNumbers && concert._ref == $concertId]{
      _id,
      type,
      number,
      redeemed,
      concert -> {
        _id
      },
      customer -> {
        _id
      }
    }`;
    const ticketsParams = { ticketNumbers, concertId };
    const tickets: Ticket[] = await sanityAdminClient.fetch(
      ticketsQuery,
      ticketsParams
    );

    // If there are no tickets found, respond with an error
    if (tickets.length === 0) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "Tickets not found for this concert" });
      return;
    }

    // Ignore the draft tickets, whose _id has draft in it
    const publishedTickets = tickets.filter(
      (ticket) => !ticket._id.includes("draft")
    );

    if (publishedTickets.length > ticketNumbers.length) {
      res
        .status(HttpStatusCode.InternalServerError)
        .json({ message: "Multiple tickets found for the same number" });
      return;
    }

    const unredeemedTickets = publishedTickets.filter(
      (ticket) => !ticket.redeemed
    );

    // console.log(publishedTickets, "publishedTickets");
    // console.log(unredeemedTickets, "unredeemedTickets");

    // If there are no unredeemed tickets, respond with an error
    if (unredeemedTickets.length === 0) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "All tickets are redeemed" });
      return;
    }

    // Find the customer by name and email, or create a new customer if one doesn't exist
    const customerQuery = `*[_type == "customer" && email == $email] {
      _id,
      name,
      email,
      tickets[] -> {
        _id,
        number,
        redeemed,
        concert -> {
          _id
        },
        customer -> {
          _id
        }
      }
    }`;
    const customerParams = { email };
    const customers: Customer[] = await sanityAdminClient.fetch(
      customerQuery,
      customerParams
    );

    // Customer not found, return an error
    if (!customers || customers.length === 0) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "Customer not found" });
      return;
    }

    if (customers.length > 1) {
      res
        .status(HttpStatusCode.InternalServerError)
        .json({ message: "Multiple customers found! Please contact support" });
      return;
    }

    const customer = customers[0];
    const customerId = customer._id;

    if (!customer) {
      res
        .status(HttpStatusCode.InternalServerError)
        .json({ message: "Failed to create/fetch customer" });
      return;
    }

    // Connect the customer to the tickets
    const ticketIds = unredeemedTickets.map((ticket) => ticket._id);

    // If the customer doesn't have the tickets, add them
    const newTickets = _.chain(ticketIds)
      .map((ticketId) => ({ _ref: ticketId, _type: "reference" }))
      .filter((ticketToAdd) => {
        // If the customer already has the ticket, don't add it
        // console.log("customer.tickets", customer.tickets);
        // console.log("ticketToAdd", ticketToAdd);

        return !_.some(customer.tickets, ["_id", ticketToAdd._ref]);
      })
      .value(); // This executes the chain

    const updatedCustomer = await sanityAdminClient
      .patch(customerId)
      .setIfMissing({ tickets: [] })
      .append("tickets", newTickets)
      .commit({ autoGenerateArrayKeys: true });

    // For each ticket, set set customer reference
    const updatedTickets = await Promise.all(
      ticketIds.map(async (ticketId) => {
        const ticket = await sanityAdminClient
          .patch(ticketId)
          .set({ customer: { _ref: customerId, _type: "reference" } })
          .commit({ autoGenerateArrayKeys: true });
        return ticket;
      })
    );

    const totalTicketCount = unredeemedTickets.length;

    // Respond with the total ticket count
    res.status(HttpStatusCode.Ok).json({
      success: true,
      totalTicketCount,
      ticketIds,
      name: customer.name,
    });
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Internal Server Error" });
  }
};

export default checkTickets;

// Type Definitions
interface Ticket {
  _id: string;
  _type: string;
  _ref?: string;
  type: string;
  number: string;
  redeemed: boolean;
  concert: Concert;
  customer: Customer;
}

interface Customer {
  _id: string;
  _type: string;
  name: string;
  email: string;
  tickets?: Ticket[];
}

interface Concert {
  _id: string;
}
