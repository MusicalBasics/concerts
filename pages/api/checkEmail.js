// Import the necessary libraries
import { createClient } from "@sanity/client";
import { HttpStatusCode } from "axios";

// Initialize the Sanity client
const client = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2022-03-25",
  useCdn: false, // Disable for authenticated requests
});

export default async (req, res) => {
  const { email, concertId } = req.body;

  if (!email || !concertId) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "Email and Concert ID are required" });
    return;
  }

  try {
    // Query Sanity for customer documents matching the provided email and concertId
    const query = `*[_type == "customer" && email == $email && concert._ref == $concertId]{
      name,
      email,
      ticketCount
    }`;
    const params = { email, concertId };
    const customers = await client.fetch(query, params);

    if (customers.length === 0) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "No tickets found for this email." });
      return;
    }

    // Respond with the found customer data
    res.status(HttpStatusCode.Ok).json(customers);
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Internal Server Error" });
  }
};
