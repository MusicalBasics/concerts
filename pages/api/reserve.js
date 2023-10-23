import { createClient } from "next-sanity";
import { HttpStatusCode } from "axios";

const client = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2023-03-01",
  token:
    "skcEET1oF0tK6FltENUhc87cmaJ3DgMngWVFCbO6UgLz8VieuUI4s817z3vuROMGwuPngGI9GkicV4xqZssf0wRWFRjKsWOHEv4eJzPCPScsncs1Lsnt3KdLTtjQSLfKvSp5fEaOwCthl1l6tAR02VHXRU4fJlG2gCosIsbESvwWxUn357ob",
  useCdn: false, // Disable for authenticated requests
});

export default async (req, res) => {
  const { name, email, selectedSeats, concertId } = req.body;

  try {
    const query = `*[_type == "customer" && name == $name && email == $email]._id`;
    const params = { name, email };
    const customerIds = await client.fetch(query, params);
    const customerId = customerIds[0];

    for (const seat of selectedSeats) {
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
      const seatData = await client.fetch(seatQuery, seatParams);

      const seatKey =
        seatData?.seatingChart?.sections[0]?.rows[0]?.seats[0]?._key;

      if (!seatKey) {
        throw new Error(`Seat not found: ${JSON.stringify(seat)}`);
      }

      console.log("seatKey", seatKey);

      const updatedSeat = await client
        .patch(concertId)
        .set({
          [`seatingChart.sections[sectionName==\"${sectionName}\"].rows[id==\"${rowId}\"].seats[_key==\"${seatKey}\"].isReserved`]:
            true,
          [`seatingChart.sections[sectionName==\"${sectionName}\"].rows[id==\"${rowId}\"].seats[_key==\"${seatKey}\"].reservedBy`]:
            {
              _type: "reference",
              _ref: customerId,
            },
        })
        .commit();

      console.log(
        "updatedSeat",
        updatedSeat.seatingChart.sections
          .find((section) => section.sectionName === sectionName)
          .rows.find((row) => row.id === rowId)
          .seats.find((seat) => seat._key === seatKey)
      );
    }

    for (const customerId of customerIds) {
      const updateCustomer = await client
        .patch(customerId)
        .set({
          redeemed: true,
        })
        .commit();

      console.log("updateCustomer", updateCustomer);
    }

    res.status(HttpStatusCode.Ok).json({ success: true });
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ success: false, message: error.message });
  }
};
