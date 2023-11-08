import {
  findDuplicateRedemptions,
  findMismatchedRedemptions,
  findMismatchedTickets,
} from "@/utils/sanity";
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
import AdminContainer from "@/components/admin/admin-container";

const CheckDuplicatesPage: FC<CheckDuplicatesPageProps> = ({
  duplicateRedemptions,
}) => {
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (id: any) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
  };

  return (
    <AdminContainer>
      <Typography variant="h4" gutterBottom>
        Check Mismatched Redemptions
      </Typography>

      <List>
        {duplicateRedemptions.length === 0 && (
          <ListItem>
            <Typography variant="h4">
              No mismatched redemptions found!
            </Typography>
          </ListItem>
        )}
        {duplicateRedemptions.map((redemption: any) => (
          <ListItem key={redemption.ticketId} sx={{ marginBottom: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">
                Seat
                <strong>{redemption.seatIdentifier || "N/A"}</strong>
              </Typography>
              {/* Display the ticket ID with a check for null */}
              <Typography variant="subtitle1">
                Ticket ID:{" "}
                <strong>{redemption.ticketId || "Not available"}</strong>
              </Typography>

              {/* Display the ticket number with a check for null */}
              <Typography variant="subtitle1">
                Ticket Number:{" "}
                <strong>{redemption.ticketNumber || "N/A"}</strong>
              </Typography>

              {/* Display the expected seat with a check for null */}
              <Typography variant="subtitle1">
                Name: <strong>{redemption.reservedBy?.name || "N/A"}</strong>
              </Typography>
            </Stack>
          </ListItem>
        ))}
      </List>
    </AdminContainer>
  );
};

export default CheckDuplicatesPage;

export const getServerSideProps = (async () => {
  try {
    const duplicateRedemptions = await findDuplicateRedemptions();
    // console.log(mismatchedRedemptions);

    return {
      props: { duplicateRedemptions },
    };
  } catch (error) {
    console.error("Error fetching mismatched redemptions", error);
    return {
      props: { duplicateRedemptions: [] },
    };
  }
}) satisfies GetServerSideProps;

interface CheckDuplicatesPageProps {
  duplicateRedemptions: any[];
}
