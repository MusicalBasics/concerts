import type { Template } from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { text, image, barcodes } from "@pdfme/schemas";

const template: Template = require("./ticket-template.json");

export const createTicket = async ({
  credits = "MUSICALBASICS PRODUCTIONS PRESENTS",
  concertName = "{CONCERT NAME ASASDASDSADSA}",
  ticketNumber = "000000000",
  venueAddress = "{Venue Address, City, State}",
  ticketQR = "000000000",
  venueName = "{Venue Name}",
  date = "{DateTime}",
  seat = "B165",
}) => {
  const plugins = { text, image, qrcode: barcodes.qrcode };
  const inputs = [
    {
      concertName,
      ticketNumber,
      credits,
      venueAddress,
      ticketQR,
      venueName,
      date,
      seat,
    },
  ];

  const ticketPdf = await generate({
    template,
    plugins,
    inputs,
  });

  return ticketPdf;
};
