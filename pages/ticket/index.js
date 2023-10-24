import fs from "fs";
import path from "path";
import sharp from "sharp";
import { parseStringPromise, Builder } from "xml2js";
import { Buffer } from "buffer";
import { getCity } from "@/data/cities";
import xss from "xss";
import { saveAs } from "file-saver";
import { Typography, Button, Stack } from "@mui/material";
import Layout from "@/components/layout";
import validator from "validator";
import Image from "next/image";

function TicketPage({ city, number, imageUrl, error }) {
  // If there's an error message, display it and don't render the rest of the component
  if (error) {
    return (
      <Layout>
        <Typography variant="h5" gutterBottom>
          Error: {error}
        </Typography>
      </Layout>
    );
  }

  const handleDownload = () => {
    saveAs(imageUrl, `Ticket-${number}.jpeg`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <Typography variant="h5" gutterBottom>
        Your Ticket for {city.name} ({city.timeFrame})
      </Typography>
      <Stack spacing={2} sx={{ marginBottom: 2 }}>
        <Typography variant="body1">
          Your ticket number is <strong>{number}</strong>
        </Typography>
        <Image src={imageUrl} alt="Ticket preview" width={1100} height={356} />
        <Stack
          spacing={2}
          direction="row"
          displayPrint={false}
          justifyContent="center"
        >
          <Button variant="contained" color="primary" onClick={handlePrint}>
            Export to PDF / Print
          </Button>
          <Button variant="contained" color="primary" onClick={handleDownload}>
            Download Your Ticket
          </Button>
        </Stack>
      </Stack>
    </Layout>
  );
}

export default TicketPage;

// server-side
export async function getServerSideProps(context) {
  let { number } = context.query;

  if (!number) {
    return {
      props: {
        error: "Missing ticket number",
      },
    };
  }

  // Ensure it's a string and it's exactly 9 characters long and only contains digits
  if (
    !validator.isLength(number, { min: 9, max: 9 }) ||
    !validator.isNumeric(number)
  ) {
    return {
      props: {
        error: "Invalid ticket number",
      },
    };
  }

  const cityId = number.substring(0, 3);
  const sanitizedCity = xss(cityId).substring(0, 3);
  const sanitizedTicket = xss(number).substring(0, 9);

  const city = getCity(sanitizedCity);
  if (!city) {
    return {
      props: {
        error: "City not found",
      },
    };
  }

  const filePath = path.join(process.cwd(), "public/images/gt_template.svg");
  const data = await fs.promises.readFile(filePath, "utf-8");

  const result = await parseStringPromise(data);

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

  var builder = new Builder();
  var xml = builder.buildObject(result);

  // Convert SVG to JPEG using Sharp
  const jpegData = await sharp(Buffer.from(xml))
    .resize(3000, 2000, { fit: "inside" })
    .jpeg()
    .toBuffer();

  // Convert the Buffer to a base64 string
  const base64Image = jpegData.toString("base64");

  return {
    props: {
      city,
      number,
      imageUrl: `data:image/jpeg;base64,${base64Image}`,
    },
  };
}
