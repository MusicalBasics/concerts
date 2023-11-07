// pages/api/tickets/unredeem.ts

import { NextApiRequest, NextApiResponse } from "next";
import { resetSeat, sanityAdminClient } from "@/utils/sanity";
import { HttpStatusCode } from "axios";
import { isInvalidateTicket } from "@/utils/ticket-utils";

export default async function unredeemTicket(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(HttpStatusCode.MethodNotAllowed)
      .end(`Method ${req.method} Not Allowed`);
  }

  const { ticketNumber } = req.body;
  if (!ticketNumber) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Ticket number must be provided." });
  }

  if (isInvalidateTicket(ticketNumber)) {
    return res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Invalid ticket number." });
  }

  try {
    // Fetch the ticket with the concert seating chart and seat details
    const ticketQuery = `*[_type == "ticket" && number == $ticketNumber]{
      _id,
      "customerId": customer->_id,
      "concertId": concert->_id,
      seat,
      "concertSeatingChartId": concert->seatingChart->_id
    }[0]`;
    const params = { ticketNumber };
    const ticket = await sanityAdminClient.fetch(ticketQuery, params);

    // console.debug("Fetched ticket", ticket);

    if (!ticket) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "Ticket not found." });
    }

    // Begin a transaction
    const transaction = sanityAdminClient.transaction();

    // Unredeem the ticket by unsetting the seat information
    transaction.patch(ticket._id, {
      set: { redeemed: false },
      unset: ["seat.section", "seat.row", "seat.number", "seat.short"],
    });

    // Unset the ticket reference from the customer if exists
    if (ticket.customerId) {
      transaction.patch(ticket.customerId, {
        unset: [`tickets[_ref=="${ticket._id}"]`],
      });

      // console.debug("Unset ticket reference from customer");
    }
    const commitResponse = await transaction.commit();

    // Unset the ticket reference from the concert seating chart
    const {
      section: sectionName,
      row: rowId,
      number: seatNumber,
    } = ticket.seat;

    const result = await resetSeat(
      ticket.concertSeatingChartId,
      sectionName,
      rowId,
      seatNumber
    );

    return res
      .status(HttpStatusCode.Ok)
      .json({ message: "Ticket unredeemed and seat updated." });
  } catch (error) {
    console.error("Unredeem ticket error:", error);
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Error unredeeming ticket." });
  }
}
