import { HttpStatusCode } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "next-sanity";

// Initialize the Sanity client
const client = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2023-03-01",
  token:
    "skHhHg8CnSmPV5G1Zduibkq2PKZ8HEqElBQofLLHNzojqu4n1zR8MBpkjdRbFNZuMvIEodoe2tWG7UkQLsuk6mjDnwHgrcdNlHQKFzPvhBosMLAwulZuyqWb37leLpSvHS9dEMo6Vbvg6rjSamY1J4IxIOMZCMo0PP2XghiyTvQNmV38r6ZH",
  useCdn: false, // Disable for authenticated requests
});

const checkTickets = async (req: NextApiRequest, res: NextApiResponse) => {
  const { name, email, ticketNumbers, concertId } = req.body;

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
    const tickets: Ticket[] = await client.fetch(ticketsQuery, ticketsParams);

    // If there are no tickets found, respond with an error
    if (tickets.length === 0) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "Tickets not found for this concert" });
      return;
    }

    // TODO: May find multiple tickets for the same number, so need to merge them

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
    const customers: Customer[] = await client.fetch(
      customerQuery,
      customerParams
    );

    let customer;
    if (customers.length === 0) {
      customer = await client.create({
        _type: "customer",
        name,
        email,
      });

      if (!customer) {
        res
          .status(HttpStatusCode.InternalServerError)
          .json({ message: "Failed to create customer" });
        return;
      }
    } else {
      customer = customers[0];
    }
    const customerId = customer._id;

    // Connect the customer to the tickets
    const ticketIds = tickets.map((ticket) => ticket._id);
    const updatedCustomer = await client
      .patch(customerId)
      .setIfMissing({ tickets: [] })
      .append("tickets", ticketIds)
      .commit();

    if (!updatedCustomer) {
      res
        .status(HttpStatusCode.InternalServerError)
        .json({ message: "Failed to link tickets to the customer" });
      return;
    }

    console.log("updatedCustomer", updatedCustomer);

    const totalTicketCount = tickets.length;

    // Respond with the total ticket count
    res.status(HttpStatusCode.Ok).json({ totalTicketCount, ticketIds });
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
  tickets: Ticket[];
}

interface Concert {
  _id: string;
}
