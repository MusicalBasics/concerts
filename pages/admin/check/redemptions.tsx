import {
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

const CheckRedemptionsPage: FC<CheckRedemptionsPageProps> = ({
  mismatchedRedemptions,
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
        {mismatchedRedemptions.length === 0 && (
          <ListItem>
            <Typography variant="h4">
              No mismatched redemptions found!
            </Typography>
          </ListItem>
        )}
        {mismatchedRedemptions.map((redemption: any) => (
          <ListItem key={redemption.ticketId} sx={{ marginBottom: 2 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle1">
                Redeemed:{" "}
                <strong>
                  {redemption.redeemed ? "redeemed" : "not redeemed"}
                </strong>
              </Typography>
              {/* Display the ticket ID with a check for null */}
              <Typography variant="subtitle1">
                Ticket ID:{" "}
                <strong>{redemption.ticketId || "Not available"}</strong>
              </Typography>

              {/* Display the ticket number with a check for null */}
              <Typography variant="subtitle1">
                Ticket Number:{" "}
                <strong>{redemption.ticketNumber || "Not available"}</strong>
              </Typography>

              {/* Display the expected seat with a check for null */}
              <Typography variant="subtitle1">
                Expected Seat:{" "}
                <strong>{redemption.expectedSeat || "Not available"}</strong>
              </Typography>

              {/* Display the found seat with a check for null */}
              <Typography variant="subtitle1">
                Found Seat:{" "}
                <strong>{redemption.foundSeat || "Not available"}</strong>
              </Typography>
            </Stack>
          </ListItem>
        ))}
      </List>
    </AdminContainer>
  );
};

export default CheckRedemptionsPage;

export const getServerSideProps = (async () => {
  try {
    const mismatchedRedemptions = await findMismatchedRedemptions();
    // console.log(mismatchedRedemptions);

    return {
      props: { mismatchedRedemptions },
    };
  } catch (error) {
    console.error("Error fetching mismatched redemptions", error);
    return {
      props: { mismatchedRedemptions: [] },
    };
  }
}) satisfies GetServerSideProps;

interface CheckRedemptionsPageProps {
  mismatchedRedemptions: any[];
}
