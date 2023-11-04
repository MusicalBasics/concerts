import { sanityClient } from "@/utils/sanity";
import { GetServerSideProps, GetStaticProps } from "next";
import React, { FC } from "react";
import _, { orderBy } from "lodash";
import { useState } from "react";
import {
  Button,
  Container,
  Input,
  List,
  ListItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { validateTicket } from "@/utils/ticket-utils";
import { validateTicketNumbers } from "@/utils/concert-utils";

const CheckTicketsPage: FC<CheckTicketsPageProps> = ({ duplicateTickets }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [ticketNumber, setTicketNumber] = useState("");

  const copyToClipboard = (id: any) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
  };

  const handleDownload = () => {
    try {
      const url = `/api/ticket/${ticketNumber}`;
      window.open(url);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        marginTop: "20px",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#00000056",
        borderRadius: "10px",
        boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
        color: "white",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems={"center"}
        justifyContent={"center"}
        p={5}
        my={5}
        sx={{
          backgroundColor: "wheat",
        }}
      >
        <TextField
          label="Ticket Number"
          variant="filled"
          color="secondary"
          onChange={(e) => setTicketNumber(e.target.value)}
          value={ticketNumber}
          error={validateTicket(ticketNumber)}
          helperText={
            validateTicket(ticketNumber) ? "Invalid Ticket Number" : ""
          }
        />
        <Button
          variant="contained"
          color="primary"
          sx={{
            fontSize: "1.3rem",
            fontWeight: "bold",
          }}
          onClick={handleDownload}
        >
          Get Your Fucking Ticket!
        </Button>
      </Stack>
      <Typography variant="h4" gutterBottom>
        Check Tickets
      </Typography>

      <List>
        {duplicateTickets.length === 0 && (
          <ListItem>
            <Typography variant="h4">No duplicate tickets found!</Typography>
          </ListItem>
        )}
        {duplicateTickets.map((ticket) => (
          <ListItem key={ticket.number}>
            <Typography variant="h4">{ticket.number}: </Typography>
            <Stack>
              {ticket.ids.map((id) => (
                <Stack
                  direction={"row"}
                  spacing={2}
                  key={id}
                  p={1}
                  alignItems={"center"}
                >
                  <Typography variant="body1">{id}</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    onClick={() => copyToClipboard(id)}
                  >
                    {copiedId === id ? "Copied!" : "Copy"}
                  </Button>
                </Stack>
              ))}
            </Stack>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default CheckTicketsPage;

export const getServerSideProps = (async () => {
  const duplicateTickets = await findDuplicateTickets();

  return {
    props: { duplicateTickets },
  };
}) satisfies GetServerSideProps;

async function findDuplicateTickets() {
  try {
    const query = '*[_type == "ticket"]{number, _id}';
    const tickets = await sanityClient.fetch(query);
    const groupedTickets = _.groupBy(tickets, "number");
    const duplicates: DuplicateTicket[] = [];
    _.forEach(groupedTickets, (ticketGroup, number) => {
      if (ticketGroup.length > 1) {
        const ids = ticketGroup.map((ticket) => ticket._id);
        duplicates.push({ number, ids });
      }
    });

    return _.orderBy(duplicates, "number");
  } catch (error: any) {
    console.error("Error fetching tickets:", error.message);
  }
}

// Type Definitions
interface DuplicateTicket {
  number: string;
  ids: string[];
}
interface CheckTicketsPageProps {
  duplicateTickets: DuplicateTicket[];
}
