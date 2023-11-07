// pages/api/[ticketNumber]/send.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createTicket, isInvalidEmail } from "@/utils/ticket-utils";
import { toConcertDate } from "@/utils/datetime-utils";
import { sanityClient } from "@/utils/sanity";

import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    const { ticketNumber } = req.query;
    const { email } = req.body;

    // Validate email
    if (isInvalidEmail(email)) {
      res.status(400).json({ message: "Invalid email" });
      return;
    }

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
    const query = `*[_type == "ticket" && number == $ticketNumber] {
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
      ticketNumber,
      ownerName: ticket.customer.name,
    });

    // Ensure that pdf.buffer is a Buffer instance, as fs.writeFileSync expects a Buffer or string.
    const pdfBuffer = Buffer.isBuffer(pdf.buffer)
      ? pdf.buffer
      : Buffer.from(pdf.buffer);

    // TODO
    // const { to, subject, text } = req.body;
    // const to = "support@musicalbasics.com";
    const to = email;
    // const to = "thomas@mier.cat";
    const subject = "Your freaking ticket";
    const text = "is here!!!";
    const html = "<h1>HTML content of the freaking ticket</h1>";

    const emailResult = await sgMail.send({
      to,
      from: "lionel@musicalbasics.com",
      subject,
      text,
      html,
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          type: "application/pdf",
          filename: "freaking-ticket.pdf",
        },
      ],
    });

    console.log("Email sent");

    res.status(200).json({ success: true, result: emailResult });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error });
  }
};
export default handler;
