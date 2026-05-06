import { Ticket } from "@/models/ticket";
import { redeemTickets } from "@/utils/sanity";
import { HttpStatusCode } from "axios";
import _ from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "next-sanity";

const sanityClient = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2023-03-01",
  token: process.env.SANITY_RESERVE_GENERAL_TOKEN || process.env.SANITY_API_TOKEN,
  useCdn: false, // Disable for authenticated requests
});

const reserveGeneralHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
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
    // Find all the tickets
    const ticketsQuery = `*[_type == "ticket" && _id in $ticketIds] {
      _id,
      customer -> {
        _id,
        name,
        email
      },
      section,
      row,
      number,
      redeemed,
      concert -> {
        _id
      }
    }`;
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

    console.log("Before concert check: tickets", tickets);

    // Make sure all the tickets belong to the given concert
    if (tickets.some((ticket) => ticket.concert._id !== concertId)) {
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

    const result = await redeemTickets({
      tickets,
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
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export default reserveGeneralHandler;
