// Import the necessary libraries
import { createClient } from "next-sanity";
import { HttpStatusCode } from "axios";

// Initialize the Sanity client
const client = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2023-03-01",
  useCdn: false, // Disable for authenticated requests
});

const checkEmail = async (req, res) => {
  const { email, concertId } = req.body;

  if (!email || !concertId) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Email and Concert ID are required" });
    return;
  }

  try {
    const query = `*[_type == "customer" && email == $email]{
      name,
      email,
      "tickets": tickets[]->{
        type,
        number,
        redeemed,
        concert-> {
          _id
        }
      }
    }`;
    const params = { email };
    const customers = await client.fetch(query, params);

    if (customers.length === 0) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "No tickets found for this email." });
      return;
    }

    // Filter out tickets that don't belong to the specified concert
    const filteredCustomers = customers.map((customer) => ({
      ...customer,
      tickets: customer.tickets.filter(
        (ticket) => ticket.concert._id === concertId
      ),
    }));

    // Sum up the golden ticket count for the customer
    const totalGoldenTicketCount = filteredCustomers.reduce(
      (acc, customer) =>
        acc +
        customer.tickets.filter(
          (ticket) => ticket.type === "golden" && !ticket.redeemed
        ).length,
      0
    );

    console.log(totalGoldenTicketCount); // Logs the total count of golden tickets

    // Respond with the total ticket count
    res
      .status(HttpStatusCode.Ok)
      .json({ totalTicketCount: totalGoldenTicketCount, customers });
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Internal Server Error" });
  }
};

export default checkEmail;
