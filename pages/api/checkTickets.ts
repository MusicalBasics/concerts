import { HttpStatusCode } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "next-sanity";

// Initialize the Sanity client
const sanityClient = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2023-03-01",
  token:
    "skHhHg8CnSmPV5G1Zduibkq2PKZ8HEqElBQofLLHNzojqu4n1zR8MBpkjdRbFNZuMvIEodoe2tWG7UkQLsuk6mjDnwHgrcdNlHQKFzPvhBosMLAwulZuyqWb37leLpSvHS9dEMo6Vbvg6rjSamY1J4IxIOMZCMo0PP2XghiyTvQNmV38r6ZH",
  useCdn: false, // Disable for authenticated requests
});

const checkTickets = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, email, concertId, ticketNumbers } = req.body;

  if (!name || !email || !ticketNumbers || !concertId) {
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

    // TODO: This query is not working
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
    const tickets: Ticket[] = await sanityClient.fetch(
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

    if (tickets.length > ticketNumbers.length) {
      res
        .status(HttpStatusCode.InternalServerError)
        .json({ message: "Multiple tickets found for the same number" });
      return;
    }

    const unredeemedTickets = tickets.filter((ticket) => !ticket.redeemed);
    // If there are no unredeemed tickets, respond with an error
    if (unredeemedTickets.length === 0) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "All tickets are redeemed" });
      return;
    }

    // Find the customer by name and email, or create a new customer if one doesn't exist
    const customerQuery = `*[_type == "customer" && name == $name && email == $email]`;
    const customerParams = { name, email };
    const customers: Customer[] = await sanityClient.fetch(
      customerQuery,
      customerParams
    );

    let customer: Customer;
    if (customers.length === 0) {
      customer = await sanityClient.create({
        _type: "customer",
        name,
        email,
      });
    } else {
      customer = customers[0];
    }
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
    // console.log("customer", customer);
    // console.log("customer.tickets", customer.tickets);

    const ticketsToAdd = ticketIds.map((ticketId) => ({
      _ref: ticketId,
      _type: "reference",
    }));

    const filteredTicketsToAdd = ticketsToAdd.filter(
      (ticketToAdd) =>
        !customer.tickets!.some(
          (customerTicket) => customerTicket._ref === ticketToAdd._ref
        )
    );

    const updatedCustomer = await sanityClient
      .patch(customerId)
      .setIfMissing({ tickets: [] })
      .append("tickets", filteredTicketsToAdd)
      .commit({ autoGenerateArrayKeys: true });

    // For each ticket, set set customer reference
    const updatedTickets = await Promise.all(
      ticketIds.map(async (ticketId) => {
        const ticket = await sanityClient
          .patch(ticketId)
          .set({ customer: { _ref: customerId, _type: "reference" } })
          .commit({ autoGenerateArrayKeys: true });
        return ticket;
      })
    );

    const totalTicketCount = unredeemedTickets.length;

    console.log("ticketIds", ticketIds);
    console.log("tickets", unredeemedTickets);
    console.log("totalTicketCount", totalTicketCount);

    console.log(totalTicketCount);

    // Respond with the total ticket count
    res
      .status(HttpStatusCode.Ok)
      .json({ success: true, totalTicketCount, ticketIds });
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
