import fs from "fs";
import path from "path";
import { HttpStatusCode } from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, email, selectedSeats, cityId, ticketNumbers } = req.body;

    // TODO: Handle ticketNumbers to mark them as redeemed.

    try {
      const filePath = path.resolve("./data/seats.json");
      const fileData = fs.readFileSync(filePath, "utf-8");
      const seatsData = JSON.parse(fileData);

      const cityData = seatsData.find((city) => city.cityId === cityId);
      if (!cityData) {
        res
          .status(HttpStatusCode.BadRequest)
          .json({ success: false, message: "Invalid city ID." });
        return;
      }

      // Check if seats are already reserved
      for (let seatId of selectedSeats) {
        const [rowId, seatNumber] = seatId.match(/^([A-Z]+)(\d+)$/).slice(1);
        const row = cityData.rows.find((row) => row.rowId === rowId);
        const seat =
          row && row.seats.find((seat) => seat.number === seatNumber);
        if (seat && seat.isReserved) {
          res.status(HttpStatusCode.BadRequest).json({
            success: false,
            message: `Seat ${seatId} is already reserved.`,
          });
          return;
        }
      }

      // Update the seats data
      selectedSeats.forEach((seatId) => {
        const [rowId, seatNumber] = seatId.match(/^([A-Z]+)(\d+)$/).slice(1);
        const row = cityData.rows.find((row) => row.rowId === rowId);
        const seat =
          row && row.seats.find((seat) => seat.number === seatNumber);
        if (seat) {
          seat.isReserved = true;
          seat.name = name;
          seat.email = email;
        }
      });

      fs.writeFileSync(filePath, JSON.stringify(seatsData, null, 2));
      res.status(HttpStatusCode.Ok).json({ success: true });
    } catch (error) {
      console.error(error);
      res
        .status(HttpStatusCode.InternalServerError)
        .json({ success: false, message: "Server error." });
    }
  } else {
    res
      .status(HttpStatusCode.MethodNotAllowed)
      .json({ success: false, message: "Method not allowed." });
  }
}
