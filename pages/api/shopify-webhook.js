import crypto from 'crypto';
import { createClient } from '@sanity/client';
import { v4 as uuidv4 } from 'uuid';

const client = createClient({
  apiVersion: '2022-03-25',
  projectId: 'zqcyefig',
  dataset: 'production',
  token: process.env.SANITY_TOKEN
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method === 'POST') {
    let rawData = '';

    req.on('data', chunk => {
      rawData += chunk;
    });

    req.on('end', async () => {
      console.log('Headers:', req.headers);
      console.log('Raw Body:', rawData);

      const SHOPIFY_SECRET = process.env.SHOPIFY_SECRET;

      const hmacHeader = req.headers['x-shopify-hmac-sha256'];
      const generatedHash = crypto
        .createHmac('sha256', SHOPIFY_SECRET)
        .update(rawData, 'utf8', 'hex')
        .digest('base64');

      console.log('Received HMAC:', hmacHeader);
      console.log('Generated HMAC:', generatedHash);

      if (generatedHash === hmacHeader) {
        console.log('Webhook verified and received:', rawData);
        
        const data = JSON.parse(rawData);
        const lineItems = data.line_items || [];
        const ticketItem = lineItems.some(item => item.name.toLowerCase().includes("ticket"));
        
        if (ticketItem) {
          const customerName = `${data.customer.first_name} ${data.customer.last_name}`;
          const customerEmail = data.customer.email;
          await createOrUpdateCustomer(customerName, customerEmail);
        }

        res.status(200).json({ message: 'Webhook received and verified' });
      } else {
        console.log('Webhook verification failed');
        res.status(401).json({ message: 'Unauthorized - Webhook verification failed' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const createOrUpdateCustomer = async (customerName, customerEmail) => {
  const cleanedEmail = customerEmail.trim();
  const query = `*[_type == "customer" && email == "${cleanedEmail}"]`;
  console.log('Running query:', query);
  const existingCustomers = await client.fetch(query);
  console.log('Query results:', existingCustomers);
  if (existingCustomers.length > 0) {
    return existingCustomers[0];
  }

  const newCustomer = {
    _type: 'customer',
    _key: uuidv4(),
    name: customerName,
    email: cleanedEmail,
    tickets: []
  };
  const createdCustomer = await client.create(newCustomer);
  console.log('New customer created:', createdCustomer);
  return createdCustomer;
};
