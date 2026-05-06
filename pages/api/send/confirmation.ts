import type { NextApiRequest, NextApiResponse } from "next";

import axios, { HttpStatusCode } from "axios";

const sendConfirmationHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Ensure this is a post request
  if (req.method !== "POST") {
    res
      .status(HttpStatusCode.MethodNotAllowed)
      .json({ message: "Method Not Allowed" });
    return;
  }

  const { email, concertName, concertDate, seats } = req.body;
  const omnisendEventId = process.env.OMNISEND_CONFIRMATION_EVENT_ID;
  const omnisendApiKey = process.env.OMNISEND_API_KEY;

  if (!omnisendEventId || !omnisendApiKey) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: "Omnisend environment variables are not configured" });
    return;
  }

  let data = JSON.stringify({
    fields: {
      seats,
      concertName,
      concertDate,
    },
    email,
  });

  let config = {
    method: "POST",
    maxBodyLength: Infinity,
    url: `https://api.omnisend.com/v3/events/${omnisendEventId}`,
    headers: {
      "X-API-KEY": omnisendApiKey,
      accept: "application/json",
      "content-type": "application/json",
    },
    data: data,
  };

  try {
    const response = await axios.request(config);

    if (response.status === HttpStatusCode.NoContent) {
      res.status(HttpStatusCode.Ok).json({ message: "Success" });
    } else {
      res
        .status(HttpStatusCode.InternalServerError)
        .json({ message: "Failed" });
    }
  } catch (error: any) {
    // console.log(error);
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message });
  }
};

export default sendConfirmationHandler;
