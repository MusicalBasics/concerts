// Import the necessary libraries
import { createClient } from "next-sanity";
import { HttpStatusCode } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getLogger } from "@/utils/logging-utils";

// Initialize the Sanity client
const client = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2023-03-01",
  useCdn: false, // Disable for authenticated requests
});

const checkEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  const logger = getLogger("api/checkEmail");

  const { email, concertId } = req.body;

  if (!email || !concertId) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Email and Concert ID are required" });
    return;
  }

  try {
    const query = `*[_type == "customer" && email == $email]{
      name,
      email,
      "tickets": tickets[]->{
        _id,
        type,
        number,
        redeemed,
        concert-> {
          _id
        }
      }
    }`;
    const params = { email };
    const customers: Customer[] = await client.fetch(query, params);

    if (customers.length === 0) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "No tickets found for this email." });
      return;
    }

    if (customers.length > 1) {
      res
        .status(HttpStatusCode.InternalServerError)
        .json({ message: "Multiple customers found with this email." });
      return;
    }

    // Found a single customer with the specified email
    const customer = customers[0];

    if (!customer.tickets || customer.tickets.length === 0) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "No tickets found for this email." });
      return;
    }

    const tickets = customer.tickets;

    // Filter out tickets that don't belong to the specified concert for this customer
    const filteredConcertTickets = tickets.filter(
      (ticket) => ticket.concert._id === concertId
    );

    if (filteredConcertTickets.length === 0) {
      res.status(HttpStatusCode.NotFound).json({
        message: "No tickets (for this concert) found for this email.",
      });
      return;
    }

    logger.debug("here");
    // Filter out tickets that have already been redeemed
    const filteredGoldenTickets = filteredConcertTickets.filter(
      (ticket) => ticket.type === "golden"
    );

    if (filteredGoldenTickets.length === 0) {
      res.status(HttpStatusCode.NotFound).json({
        message: "No golden tickets found for this email.",
      });
      return;
    }

    // Filter out tickets that have already been redeemed
    const filteredTickets = filteredGoldenTickets.filter(
      (ticket) => ticket.redeemed === false
    );

    if (filteredTickets.length === 0) {
      res.status(HttpStatusCode.NotFound).json({
        message: "No unredeemed golden tickets found for this email.",
      });
      return;
    }

    // Found our tickets
    const totalTicketCount = filteredTickets.length;
    const ticketIds = filteredTickets.map((ticket) => ticket._id);

    // Respond with the total ticket count
    res
      .status(HttpStatusCode.Ok)
      .json({
        success: true,
        totalTicketCount,
        ticketIds,
        customerName: customer.name,
      });
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Internal Server Error" });
  }
};

export default checkEmail;

// Type Definitions
interface Customer {
  name: string;
  email: string;
  tickets: Ticket[];
}

interface Ticket {
  _id: string;
  type: string;
  number: string;
  redeemed: boolean;
  concert: Concert;
}

interface Concert {
  _id: string;
}
