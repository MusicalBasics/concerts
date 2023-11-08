import React, { FC, useState } from "react";
import { GetServerSideProps } from "next";
import _ from "lodash";
import {
  Button,
  Container,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import AdminContainer from "@/components/admin/admin-container";
import { findMismatchedSeats } from "@/utils/sanity";

const CheckSeatsPage: FC<CheckSeatsPageProps> = ({ mismatchedSeats }) => {
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (id: any) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
  };

  // Group the mismatchedSeats by seatingChartId
  const groupedSeats = _.groupBy(
    mismatchedSeats,
    (data) => data.seat.seatingChartId
  );

  return (
    <AdminContainer>
      <Typography variant="h4" gutterBottom>
        Check Mismatched Seats
      </Typography>
      <Container>
        {_.map(groupedSeats, (seats, seatingChartId) => (
          <React.Fragment key={seatingChartId}>
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Seating Chart ID: <strong>{seatingChartId}</strong> (
              {seats.length})
            </Typography>
            <List>
              {seats.map((data, index) => {
                const seat = data.seat;
                return (
                  <ListItem key={index} sx={{ mb: 2 }}>
                    <Stack spacing={1}>
                      {/* ... the rest of the seat information goes here ... */}
                      {index + 1}
                      <Typography variant="subtitle1">
                        Seat:{" "}
                        <strong>
                          {`${seat.sectionName}-${seat.rowId}${seat.number}` ||
                            "Seat info missing"}
                        </strong>
                      </Typography>
                      <Typography variant="subtitle1">
                        Status:{" "}
                        <strong>
                          {seat.isReserved ? "Is reserved" : "Is not reserved"}
                        </strong>
                      </Typography>
                      {/* Show reservedBy */}
                      {seat.reservedBy && (
                        <Typography variant="subtitle1">
                          Reserved by: <strong>{seat.reservedBy?.name}</strong>
                        </Typography>
                      )}
                      {/* Show ticket */}
                      {seat.redeemedTicket ? (
                        <Typography variant="subtitle1">
                          Ticket Seat:{" "}
                          <strong>{seat.redeemedTicket.seat.short}</strong>
                        </Typography>
                      ) : (
                        <Typography color="error">
                          "No redeemed ticket found!"
                        </Typography>
                      )}
                      <Typography variant="body2" color="error">
                        {data.message}
                      </Typography>
                    </Stack>
                  </ListItem>
                );
              })}
            </List>
          </React.Fragment>
        ))}
      </Container>
    </AdminContainer>
  );
};

export default CheckSeatsPage;

export const getServerSideProps: GetServerSideProps = async () => {
  const mismatchedSeats = await findMismatchedSeats();

  return {
    props: { mismatchedSeats },
  };
};

interface CheckSeatsPageProps {
  mismatchedSeats: any[]; // You should replace any[] with the correct type for your mismatchedSeats
}
