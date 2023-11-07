import { findDuplicateTickets } from "@/utils/sanity";
import { GetServerSideProps } from "next";
import React, { FC } from "react";
import _ from "lodash";
import { useState } from "react";
import {
  Button,
  Container,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import { DuplicateTicket } from "@/models/Ticket";

const CheckTicketsPage: FC<CheckTicketsPageProps> = ({ duplicateTickets }) => {
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (id: any) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
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

interface CheckTicketsPageProps {
  duplicateTickets: DuplicateTicket[];
}
