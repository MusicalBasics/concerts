import fs from "fs";
import path from "path";
import { HttpStatusCode } from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, cityId } = req.body;

    if (!email || !cityId) {
      res
        .status(HttpStatusCode.BadRequest)
        .json({ error: "Missing email or cityId" });
      return;
    }

    try {
      // Construct the file path based on the cityId
      const filePath = path.resolve(`./data/tickets${cityId}.json`);
      const fileData = fs.readFileSync(filePath, "utf-8");
      const cityData = JSON.parse(fileData);

      // Assume ticketsData is an array of objects with an email property
      const userTickets = cityData.ticketsData.filter(
        (ticket) => ticket.email === email
      );

      if (userTickets.length > 0) {
        res.status(HttpStatusCode.Ok).json({ ticketCount: userTickets.length });
      } else {
        res
          .status(HttpStatusCode.NotFound)
          .json({ error: "No tickets found for this email" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(HttpStatusCode.InternalServerError)
        .json({ error: "Server error" });
    }
  } else {
    res
      .status(HttpStatusCode.MethodNotAllowed)
      .json({ error: "Method not allowed" });
  }
}
