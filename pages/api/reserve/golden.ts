import { HttpStatusCode } from "axios";
import _ from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import { redeemTickets, sanityAdminClient } from "@/utils/sanity";
import { Ticket } from "@/models/ticket";
import { Seat } from "@/models/seat";

interface reserveGoldenNextApiRequest extends NextApiRequest {
  body: {
    name: string;
    email: string;
    selectedSeats: Seat[];
    concertId: string;
    ticketIds: string[];
  };
}

const reserveGoldenHandler = async (
  req: reserveGoldenNextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    res.status(HttpStatusCode.MethodNotAllowed).end();
    return;
  }

  const { name, email, selectedSeats, concertId, ticketIds } = req.body;

  if (!name || !email || !selectedSeats || !concertId || !ticketIds) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Missing required fields" });
    return;
  }

  if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Selected seats must be a non-empty array" });
    return;
  }

  if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Ticket IDs must be a non-empty array" });
    return;
  }

  if (selectedSeats.length !== ticketIds.length) {
    res.status(HttpStatusCode.BadRequest).json({
      message: "Selected seats and ticket IDs must be the same length",
    });
    return;
  }

  try {
    // Get all the tickets for the customer by ticket ids
    const ticketsQuery = `*[_type == "ticket" && _id in $ticketIds] {
        _id,
    }`;
    const ticketsParams = { ticketIds };
    const goldenTickets: Ticket[] = await sanityAdminClient.fetch(
      ticketsQuery,
      ticketsParams
    );

    if (goldenTickets.length === 0) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "Tickets not found" });
      return;
    }

    const result = await redeemTickets({
      tickets: goldenTickets,
      selectedSeats,
      concertId,
      name,
      email,
    });

    if (!result.success) {
      res.status(result.status).json({ message: result.message });
      return;
    }

    res.status(HttpStatusCode.Ok).json({ success: true });
  } catch (error: any) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ success: false, message: error.message });
  }
};

export default reserveGoldenHandler;
