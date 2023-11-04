import React, { FC } from "react";
import { GetServerSideProps } from "next";
import { sanityClient } from "@/utils/sanity"; // Import sanityClient from your utility file
import { Ticket } from "@/models/Ticket"; // Import your Ticket model
import { getFormattedDate } from "@/utils/concert-utils";
import { Button, Container } from "@mui/material";
import type { Template } from "@pdfme/common";
import { generate } from "@pdfme/generator";
import { createTicket } from "@/utils/ticket-utils";

interface GeneratePageProps {
  ticket: Ticket;
}

const GeneratePage: FC<GeneratePageProps> = ({ ticket }) => {
  const handleDownload = () => {
    const url = `/api/ticket/${ticket.number}`;
    window.open(url);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Button variant="contained" color="primary" onClick={handleDownload}>
        Here's your freaking ticket!
      </Button>
    </Container>
  );
};

export default GeneratePage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { ticketNumber } = context.params!;
  if (!ticketNumber || ticketNumber.length != 9) {
    return {
      notFound: true,
    };
  }
  const query = `
  *[_type == "ticket" && number == $ticketNumber] {
      number,
      redeemed,
    }
  `;

  const params = { ticketNumber };
  const tickets = await sanityClient.fetch(query, params);

  if (!tickets.length) {
    return {
      notFound: true,
    };
  }

  const ticket = tickets[0];

  if (!ticket.redeemed) {
    return {
      notFound: true,
    };
  }

  // Browser
  // const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
  // window.open(URL.createObjectURL(blob));

  // Node.js
  // fs.writeFileSync(path.join(__dirname, `test.pdf`), pdf);

  return {
    props: {
      ticket,
    },
  };
};
