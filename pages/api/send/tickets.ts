// pages/api/send/tickets.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createTicket, isInvalidateTicket } from "@/utils/ticket-utils";
import { toConcertDate } from "@/utils/concert-utils";
import { sanityClient } from "@/utils/sanity";

import sgMail from "@sendgrid/mail";
import type { Ticket } from "@/models/ticket";
sgMail.setApiKey(
  "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"
);

export const maxDuration = 30; // Vercel timeout

const sendTicketsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    const { ticketIds } = req.body;

    // Validate ticket numbers
    if (ticketIds.length === 0) {
      res.status(400).json({ message: "No ticket numbers provided" });
      return;
    }

    // Fetch ticket data from Sanity
    const query = `*[_type == "ticket" && _id in $ticketIds] {
      _id,
      number,
      redeemed,
      customer->{
        name,
        email
      },
      concert->{
        name,
        date,
        timeZone,
        venue->{
          name,
          address
        }
      },
      redeemedSeat -> {
        venue -> {
          name,
          // ... other venue fields ...
        },
        section,
        row,
        number,
      },
    }`;
    const params = { ticketIds };
    const tickets = await sanityClient.fetch(query, params);

    // console.debug("params", params);
    // console.debug("tickets", tickets);

    // Validate ticket number
    if (tickets.length === 0) {
      res.status(404).json({ message: "Ticket not found" });
      return;
    }

    // Validate ticket redemption
    if (tickets.some((ticket: Ticket) => !ticket.redeemed)) {
      const ticketsNotRedeemed = tickets.filter(
        (ticket: Ticket) => !ticket.redeemed
      );

      res.status(400).json({
        message: `Some ticket(s) have not been redeemed: ${ticketsNotRedeemed
          .map((ticket: Ticket) => ticket.number)
          .join(", ")}`,
      });
      return;
    }

    // Check for tickets without customers
    const ticketsWithoutCustomers = tickets.filter(
      (ticket: any) => !ticket.customer
    );
    if (ticketsWithoutCustomers.length > 0) {
      res
        .status(400)
        .json({ message: "Some tickets do not have an assigned customer." });
      return;
    }

    // Check for tickets without customers' emails
    const ticketsWithoutEmails = tickets.filter(
      (ticket: any) => !ticket.customer.email
    );
    if (ticketsWithoutEmails.length > 0) {
      res
        .status(400)
        .json({ message: "Some tickets do not have an assigned email." });
      return;
    }

    // Check for tickets without a concert
    const ticketsWithoutConcerts = tickets.filter(
      (ticket: any) => !ticket.concert
    );
    if (ticketsWithoutConcerts.length > 0) {
      res
        .status(400)
        .json({ message: "Some tickets do not have an assigned concert." });
      return;
    }

    // Check for tickets without seats or with incomplete seat information
    const ticketsWithInvalidSeats = tickets.filter((ticket: any) => {
      return (
        !ticket.redeemedSeat ||
        !ticket.redeemedSeat.row ||
        !ticket.redeemedSeat.number
      );
    });

    if (ticketsWithInvalidSeats.length > 0) {
      res.status(400).json({
        message:
          "Some tickets do not have a complete seat assignment (missing row or number).",
      });
      return;
    }

    // TODO: Send emails 25 at a time
    const emailResults = await Promise.all(
      tickets.map((ticket: any) => {
        const emailResult = sendEmail(ticket);
        if (!emailResult) {
          res.status(500).json({
            success: false,
            error: `Email not sent to ${ticket.customer.email}`,
          });
          return null;
        }
        return emailResult;
      })
    );

    res.status(200).json({ success: true, result: emailResults });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error });
  }
};
export default sendTicketsHandler;

async function sendEmail(ticket: any) {
  try {
    // Generate PDF
    const email = ticket.customer.email;
    const credits = "MUSICALBASICS PRODUCTIONS PRESENTS";
    const concertName = ticket.concert.name;
    const venueName = ticket.concert.venue.name;
    const venueAddress = ticket.concert.venue.address;
    const date = toConcertDate(ticket.concert.date, ticket.concert.timeZone);
    const { row, number } = ticket.redeemedSeat;
    const seat = `${row}${number}`;
    const ticketNumber = ticket.number;
    const ownerName = ticket.customer.name;

    const pdf = await createTicket({
      credits,
      concertName,
      venueName,
      venueAddress,
      date,
      seat,
      ticketNumber,
      ownerName,
    });

    // Ensure that pdf.buffer is a Buffer instance, as fs.writeFileSync expects a Buffer or string.
    const pdfBuffer = Buffer.isBuffer(pdf.buffer)
      ? pdf.buffer
      : Buffer.from(pdf.buffer);

    const to = email;
    //   const subject = `Your ticket ${ticketNumber} for ${concertName} is here!!!`;
    //   const text = `Hi ${ownerName},\n\n
    // Here's your ticket for ${concertName} at ${venueName} on ${date}.\n\n
    // Your seat is ${seat}.\n\n
    // See you there!\n\n
    // MusicalBasics Team`;
    //   const html = "<h1>HTML content of the ticket</h1>";
    const filename = `ticket-${ticketNumber}.pdf`;

    const emailResult = await sgMail.send({
      to,
      from: "support@musicalbasics.com",
      templateId: "d-258b2382847b44aca0ab3fa0e355fa17",
      dynamicTemplateData: {
        ownerName,
        concertName,
        seat,
        ticketNumber,
        date,
        venueName,
        venueAddress,
      },
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          type: "application/pdf",
          filename,
        },
      ],
    });

    return emailResult;
  } catch (error) {
    console.error(error);
    return null;
  }
}
