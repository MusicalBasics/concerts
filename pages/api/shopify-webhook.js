import crypto from 'crypto';

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

    req.on('end', () => {
      console.log('Headers:', req.headers);
      console.log('Raw Body:', rawData);

      // Your Shopify secret used for HMAC verification
      const SHOPIFY_SECRET = '37ccffd436511de0f2b580de1d6a70672b0d6c3d8f82cd9ca9ea00fa90e18db5';

      // Extract the HMAC from the headers
      const hmacHeader = req.headers['x-shopify-hmac-sha256'];
      const generatedHash = crypto
        .createHmac('sha256', SHOPIFY_SECRET)
        .update(rawData, 'utf8', 'hex')
        .digest('base64');

      // Log the HMAC values for comparison
      console.log('Received HMAC:', hmacHeader);
      console.log('Generated HMAC:', generatedHash);

      if (generatedHash === hmacHeader) {
        console.log('Webhook verified and received:', rawData);
        res.status(200).json({ message: 'Webhook received and verified' });
      } else {
        console.log('Webhook verification failed');
        console.log('Mismatch between received and generated HMAC');
        res.status(401).json({ message: 'Unauthorized - Webhook verification failed' });
      }
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
