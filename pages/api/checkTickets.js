import { HttpStatusCode } from "axios";
import { sanityClient } from "@/utils/sanity";

// Initialize the Sanity client
const client = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2023-03-01",
  useCdn: false, // Disable for authenticated requests
});

const checkTickets = async (req, res) => {
  const { name, email, ticketNumbers, concertId } = req.body;

  if (!name || !email || !ticketNumbers || !concertId) {
    res
      .status(HttpStatusCode.BadRequest)
      .json({ message: "All fields are required" });
    return;
  }

  try {
    // Find the unredeemed tickets by ticket numbers, and make sure they belong to the specified concert
    const query = `*[_type == "ticket" && number in $ticketNumbers && !redeemed && concert._id == $concertId]`;
    const params = { ticketNumbers, concertId };
    const ticketData = await client.fetch(query, params);

    // If there are no tickets found, respond with an error
    if (ticketData.length === 0 || ticketData.length > ticketNumbers.length) {
      res.status(HttpStatusCode.NotFound).json({ message: "Ticket not found" });
      return;
    }

    // Find the customer by name and email, or create a new customer if one doesn't exist
    const customerQuery = `*[_type == "customer" && name == $name && email == $email]`;
    const customerParams = { name, email };
    const customers = await client.fetch(customerQuery, customerParams);

    let customerId;
    let customer;

    if (customers.length === 0) {
      customer = await client.create({
        _type: "customer",
        name,
        email,
      });

      customerId = customer._id;
    } else {
      customer = customers[0];
      customerId = customer._id;
    }

    // Connect the customer to the tickets
    const ticketIds = ticketData.map((ticket) => ticket._id);
    const updatedCustomer = await client
      .patch(customerId)
      .setIfMissing({ tickets: [] })
      .append("tickets", ticketIds);

    console.log(updatedCustomer);

    const totalTicketCount = ticketData.length;

    // Respond with the total ticket count
    res.status(HttpStatusCode.Ok).json({ totalTicketCount });
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Internal Server Error" });
  }
};

export default checkTickets;
