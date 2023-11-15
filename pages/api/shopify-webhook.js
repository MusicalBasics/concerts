// pages/api/shopify-webhook.js

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Log the request body to see the webhook data
    console.log('Webhook received:', req.body);

    // Send a response back to acknowledge receipt
    res.status(200).json({ message: 'Webhook received successfully' });
  } else {
    // Handle any other HTTP methods
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}