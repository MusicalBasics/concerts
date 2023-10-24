import { HttpStatusCode } from "axios";
import _ from "lodash";
import { createClient } from "@sanity/client";

const sanityClient = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2023-03-01",
  token:
    "skcEET1oF0tK6FltENUhc87cmaJ3DgMngWVFCbO6UgLz8VieuUI4s817z3vuROMGwuPngGI9GkicV4xqZssf0wRWFRjKsWOHEv4eJzPCPScsncs1Lsnt3KdLTtjQSLfKvSp5fEaOwCthl1l6tAR02VHXRU4fJlG2gCosIsbESvwWxUn357ob",
  useCdn: false, // Disable for authenticated requests
});

const reserveGolden = async (req, res) => {
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

  if (!Array.isArray(ticketIds)) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Ticket IDs must be an array" });
    return;
  }

  if (selectedSeats.length !== ticketIds.length) {
    res.status(HttpStatusCode.BadRequest).json({
      message: "Selected seats and ticket IDs must be the same length",
    });
    return;
  }

  try {
    // Find the customer by name and email
    const query = `*[_type == "customer" && name == $name && email == $email]`;
    const params = { name, email };
    const customers = await sanityClient.fetch(query, params);

    if (customers.length === 0) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "Customer not found" });
      return;
    }

    if (customers.length > 1) {
      res
        .status(HttpStatusCode.InternalServerError)
        .json({ message: "Multiple customers found" });
      return;
    }

    // Found the customer
    const customer = customers[0];
    const customerId = customer._id;

    // Get all the tickets for the customer by ticket ids
    const ticketsQuery = `*[_type == "ticket" && _id in $ticketIds]`;
    const ticketsParams = { ticketIds };
    const goldenTickets = await sanityClient.fetch(ticketsQuery, ticketsParams);

    // Go through each selected seat and update the seat to be reserved by the customer
    for (const [ticket, seat] of _.zip(goldenTickets, selectedSeats)) {
      const ticketId = ticket._id;
      const { sectionName, rowId, seatNumber } = seat;

      const seatQuery = `*[_type == "concert" && _id == $concertId]{
        seatingChart {
          sections[sectionName == $sectionName] {
            rows[id == $rowId] {
              seats[number == $seatNumber] {
                _key
              }
            }
          }
        }
      }[0]`;

      const seatParams = { concertId, sectionName, rowId, seatNumber };
      const seatData = await sanityClient.fetch(seatQuery, seatParams);

      const seatKey =
        seatData?.seatingChart?.sections[0]?.rows[0]?.seats[0]?._key;

      if (!seatKey) {
        res.status(HttpStatusCode.InternalServerError).json({
          message: `Seat ${sectionName}-${rowId}${seatNumber} not found`,
        });
        return;
      }

      // Update the seat to be reserved by the customer
      const updatedSeat = await sanityClient
        .patch(concertId)
        .set({
          [`seatingChart.sections[sectionName==\"${sectionName}\"].rows[id==\"${rowId}\"].seats[_key==\"${seatKey}\"].isReserved`]: true,
          [`seatingChart.sections[sectionName==\"${sectionName}\"].rows[id==\"${rowId}\"].seats[_key==\"${seatKey}\"].reservedBy`]:
            {
              _type: "reference",
              _ref: customerId,
            },
          [`seatingChart.sections[sectionName==\"${sectionName}\"].rows[id==\"${rowId}\"].seats[_key==\"${seatKey}\"].redeemedTicket`]:
            {
              _type: "reference",
              _ref: ticketId,
            },
        })
        .commit();

      if (!updatedSeat) {
        res.status(HttpStatusCode.InternalServerError).json({
          message: `Unable to reserve the Seat ${sectionName}-${rowId}${seatNumber}`,
        });
        return;
      }

      console.log(
        "updatedSeat",
        updatedSeat.seatingChart.sections
          .find((section) => section.sectionName === sectionName)
          .rows.find((row) => row.id === rowId)
          .seats.find((seat) => seat._key === seatKey)
      );

      // Update the ticket to be redeemed
      const redeemedTicket = await sanityClient
        .patch(ticketId)
        .set({ redeemed: true })
        .commit();

      if (!redeemedTicket) {
        res.status(HttpStatusCode.InternalServerError).json({
          message: `Unable to redeem the ticket ${ticketId}`,
        });
        return;
      }

      console.log("redeemedTicket", redeemedTicket);
    }

    res.status(HttpStatusCode.Ok).json({ success: true });
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ success: false, message: error.message });
  }
};

export default reserveGolden;
