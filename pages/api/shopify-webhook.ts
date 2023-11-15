import { NextApiResponse, NextApiRequest } from "next";
import crypto from "crypto";
import { validateEmail } from "@/utils/concert-utils";
import { sanityAdminClient } from "@/utils/sanity";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    let rawData = "";

    req.on("data", (chunk) => {
      rawData += chunk;
    });

    req.on("end", async () => {
      console.log("Headers:", req.headers);
      console.log("Raw Body:", rawData);

      const SHOPIFY_SECRET = process.env.SHOPIFY_SECRET;

      const hmacHeader = req.headers["x-shopify-hmac-sha256"];
      const generatedHash = crypto
        .createHmac("sha256", SHOPIFY_SECRET)
        .update(rawData, "utf8", "hex")
        .digest("base64");

      console.log("Received HMAC:", hmacHeader);
      console.log("Generated HMAC:", generatedHash);

      if (generatedHash === hmacHeader) {
        console.log("Webhook verified and received:", rawData);

        const data = JSON.parse(rawData);
        const lineItems = data.line_items || [];
        const ticketItem = lineItems.some((item) =>
          item.name.toLowerCase().includes("ticket")
        );

        if (ticketItem) {
          const customerName = `${data.customer.first_name} ${data.customer.last_name}`;
          const customerEmail = data.customer.email;
          await createOrUpdateCustomer(customerName, customerEmail);
        }

        res.status(200).json({ message: "Webhook received and verified" });
      } else {
        console.log("Webhook verification failed");
        res
          .status(401)
          .json({ message: "Unauthorized - Webhook verification failed" });
      }
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const createOrUpdateCustomer = async (
  customerName: string,
  customerEmail: string
) => {
  try {
    const cleanedEmail = customerEmail.trim();

    if (!validateEmail(cleanedEmail)) {
      throw new Error("Invalid email");
    }

    const customerQuery = `*[_type == "customer" && email == "${cleanedEmail}"]`;
    console.log("Running query:", customerQuery);
    const existingCustomers = await sanityAdminClient.fetch(customerQuery);
    console.log("Query results:", existingCustomers);
    if (existingCustomers.length > 0) {
      return existingCustomers[0];
    }

    const newCustomer = {
      _type: "customer",
      name: customerName,
      email: cleanedEmail,
    };

    const createdCustomer = await sanityAdminClient.create(newCustomer);

    console.log("New customer created:", createdCustomer);
    return createdCustomer;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
};
