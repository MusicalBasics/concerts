// pages/api/ticket/[ticketNumber].ts

import { NextApiRequest, NextApiResponse } from "next";
import { createTicket } from "@/utils/ticket-utils";
import { sanityClient } from "@/utils/sanity";
import { toConcertDate } from "@/utils/datetime-utils";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { ticketNumber } = req.query;

    // Validate ticket number
    if (
      !ticketNumber ||
      typeof ticketNumber !== "string" ||
      ticketNumber.length !== 9 ||
      isNaN(Number(ticketNumber))
    ) {
      res.status(400).json({ message: "Invalid ticket number" });
      return;
    }

    // Fetch ticket data from Sanity
    const query = `
  *[_type == "ticket" && number == $ticketNumber] {
      number,
      concert-> {
        name,
        date,
        venue-> {
          name,
          address,
          // ... other venue fields ...
        },
        // ... other concert fields ...
      },
      redeemed,
      type,
      customer-> {
        name,
        email,
        // ... other customer fields ...
      },
      seat {
        venue-> {
          name,
          // ... other venue fields ...
        },
        seatingChart-> {
          name,
          // ... other seating chart fields ...
        },
        short,
        section,
        row,
        number,
      },
    }
  `;
    const params = { ticketNumber };
    const tickets = await sanityClient.fetch(query, params);

    // Validate ticket number
    if (tickets.length === 0) {
      res.status(404).json({ message: "Ticket not found" });
      return;
    }

    const ticket = tickets[0];

    // Validate ticket redemption
    if (!ticket.redeemed) {
      res.status(400).json({ message: "Ticket has not been redeemed" });
      return;
    }

    // Generate PDF
    const credits = "MUSICALBASICS PRODUCTIONS PRESENTS";
    const concertName = ticket.concert.name;
    const venueName = ticket.concert.venue.name;
    const venueAddress = ticket.concert.venue.address;
    const date = toConcertDate(ticket.concert.date);
    const { row, number } = ticket.seat;
    const seat = `${row}${number}`;

    const pdf = await createTicket({
      credits,
      concertName,
      venueName,
      venueAddress,
      date,
      seat,
    });

    // Ensure that pdf.buffer is a Buffer instance, as fs.writeFileSync expects a Buffer or string.
    const buffer = Buffer.isBuffer(pdf.buffer)
      ? pdf.buffer
      : Buffer.from(pdf.buffer);

    // Set up PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ticket-${ticketNumber}.pdf`
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
