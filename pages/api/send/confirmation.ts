import type { NextApiRequest, NextApiResponse } from "next";

import axios, { HttpStatusCode } from "axios";

const SSC_EVENT_ID = "6535ee3a500e946233c6fb86";
const OMNISEND_API_KEY =
  "63217d1f23c4cf3c70415ee0-GYSiRXMum8GJ1v676IK2LhMa2RkyVEYa4wx2AdT8l0lCU13A9J";

const sendConfirmationHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Ensure this is a post request
  if (req.method !== "POST") {
    res
      .status(HttpStatusCode.MethodNotAllowed)
      .json({ message: "Method Not Allowed" });
    return;
  }

  const { email, concertName, concertDate, seats } = req.body;

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
    url: `https://api.omnisend.com/v3/events/${SSC_EVENT_ID}`,
    headers: {
      "X-API-KEY": OMNISEND_API_KEY,
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
