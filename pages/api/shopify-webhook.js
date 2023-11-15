// pages/api/shopify-webhook.js
import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method === 'POST') {

    // Convert the request body to a string for logging
    const bodyString = JSON.stringify(req.body);

    console.log('Headers:', req.headers);
    console.log('Body:', bodyString);

    // Your Shopify secret used for HMAC verification
    const SHOPIFY_SECRET = '37ccffd436511de0f2b580de1d6a70672b0d6c3d8f82cd9ca9ea00fa90e18db5';

    // Extract the HMAC from the headers
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    const generatedHash = crypto
      .createHmac('sha256', SHOPIFY_SECRET)
      .update(bodyString, 'utf8', 'hex')
      .digest('base64');

    // Log the HMAC values for comparison
    console.log('Received HMAC:', hmacHeader);
    console.log('Generated HMAC:', generatedHash);

    if (generatedHash === hmacHeader) {
      console.log('Webhook verified and received:', bodyString);
      res.status(200).json({ message: 'Webhook received and verified' });
    } else {
      console.log('Webhook verification failed');
      console.log('Mismatch between received and generated HMAC');
      res.status(401).json({ message: 'Unauthorized - Webhook verification failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
