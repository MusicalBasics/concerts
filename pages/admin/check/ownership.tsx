import { findMismatchedTickets } from "@/utils/sanity";
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
import { MismatchedTicket } from "@/models/Ticket";
import AdminContainer from "@/components/admin/admin-container";

const CheckOwnershipPage: FC<CheckOwnershipPageProps> = ({
  mismatchedTickets,
}) => {
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (id: any) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
  };

  return (
    <AdminContainer>
      <Typography variant="h4" gutterBottom>
        Check Mismatched Tickets
      </Typography>

      <List>
        {mismatchedTickets.length === 0 && (
          <ListItem>
            <Typography variant="h4">No mismatched tickets found!</Typography>
          </ListItem>
        )}
        {mismatchedTickets.map((ticket) => (
          <ListItem key={ticket.ticketId} sx={{ marginBottom: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">
                Customer ID: <strong>{ticket.customerId}</strong>
              </Typography>
              <Typography variant="subtitle1">
                Customer Name: <strong>{ticket.customerName}</strong>
              </Typography>
              <Typography variant="subtitle1">
                Ticket ID: <strong>{ticket.ticketId}</strong>
              </Typography>
              <Typography variant="subtitle1">
                Ticket Number: <strong>{ticket.ticketNumber}</strong>
              </Typography>
              <Typography variant="subtitle1">
                Assigned Customer ID:{" "}
                <strong>{ticket.assignedCustomerId || "null"}</strong>
              </Typography>
              <Typography variant="body2" color="error">
                This ticket is assigned to customer ID{" "}
                {ticket.assignedCustomerId}, which does not match the customer
                ID {ticket.customerId} that it's listed under.
              </Typography>
            </Stack>
          </ListItem>
        ))}
      </List>
    </AdminContainer>
  );
};

export default CheckOwnershipPage;

export const getServerSideProps = (async () => {
  const mismatchedTickets = await findMismatchedTickets();

  return {
    props: { mismatchedTickets },
  };
}) satisfies GetServerSideProps;

interface CheckOwnershipPageProps {
  mismatchedTickets: MismatchedTicket[];
}
