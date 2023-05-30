import xss from "xss";
import { parseStringPromise, Builder } from "xml2js";
import { StatusCodes } from "http-status-codes";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { Buffer } from "buffer";
import { getCity } from "@/data/cities";

export default async function handler(req, res) {
  try {
    // Get data from request body
    const { cityId, ticket } = req.body;

    // Sanitize inputs
    const sanitizedCity = xss(cityId).substring(0, 3);
    const sanitizedTicket = xss(ticket).substring(0, 9);

    // Ticket must be 9 characters long
    if (sanitizedTicket.length !== 9) {
      return res.status(StatusCodes.BAD_REQUEST).send("Invalid Ticket Number");
    }

    const city = getCity(sanitizedCity);

    if (!city) {
      return res.status(StatusCodes.NOT_FOUND).send("City not found");
    }

    // Read the SVG file
    const filePath = path.join(process.cwd(), "public/images/gt_template.svg");
    const data = await fs.readFile(filePath, "utf-8");

    // Parse the SVG data to a JavaScript object
    const result = await parseStringPromise(data);

    // Find the elements by id and replace their text
    const traverse = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === "object") {
          traverse(obj[key]);
        } else if (key === "_") {
          if (obj["$"].id === "city") {
            obj[key] = city.name;
          } else if (obj["$"].id === "ticket") {
            obj[key] = sanitizedTicket;
          } else if (obj["$"].id === "startMonth") {
            obj[key] = city.startDate;
          } else if (obj["$"].id === "endMonth") {
            obj[key] = city.endDate;
          }
        }
      }
    };
    traverse(result);

    // Convert the JavaScript object back to XML
    var builder = new Builder();
    var xml = builder.buildObject(result);

    // Convert SVG to JPEG using Sharp
    const jpegData = await sharp(Buffer.from(xml))
      .resize(3000, 2000, { fit: "inside" })
      .jpeg()
      .toBuffer();

    // Send the JPEG data as the response
    res.setHeader("Content-Type", "image/jpeg");
    res.status(StatusCodes.OK).send(jpegData);
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
}
