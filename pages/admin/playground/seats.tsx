// import SeatingMap from "@/components/concerts/SeatingMaps";
import React, { FC } from "react";
import {
  FormatedSeat,
  getAllFormatedSeats,
  sanityClient,
} from "@/utils/sanity";
import { GetServerSideProps } from "next";
import { Section } from "@/models/Section";
import { Button, Container, Stack, Typography } from "@mui/material";
import _ from "lodash";
import { Concert } from "@/models/Concert";
import Row from "@/models/Row";

interface SeatsPlaygroundPageProps {
  // Define any props needed for the component
  seats: FormatedSeat[];
}

const SeatsPlaygroundPage: FC<SeatsPlaygroundPageProps> = ({ seats }) => {
  const flattenSections = () => {
    return _.flatMap(sections, (section) =>
      _.flatMap(section.rows, (row) =>
        _.map(row.seats, (seat) => ({
          seatNumber: `${row.id}${seat.number}`,
          name: seat.reservedBy ? seat.reservedBy.name : "",
          email: seat.reservedBy ? seat.reservedBy.email : "",
        }))
      )
    );
  };

  const convertToCsv = (data: any[]) => {
    const csvRows = [
      ["Seat Number", "Name", "Email"], // headers
      ...data.map((item) => [item.seatNumber, item.name, item.email]),
    ];
    return csvRows.join("\n");
  };

  const downloadCsv = (csv: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "seats.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = () => {
    const flatData = flattenSections();
    const csv = convertToCsv(flatData);
    downloadCsv(csv);
  };

  // Is reserved but not reserved by any user (no customer reference)
  const getSeatsReservedWithoutUser = (row: Row) => {
    return row.seats.filter((seat) => seat.isReserved && !seat.reservedBy);
  };

  return (
    // Define the component's JSX
    <Container>
      <Stack
        py={5}
        sx={{
          color: "white",
        }}
        gap={2}
      >
        <Typography variant="h4">Seats Playground</Typography>
        {/* Display my seats */}
        <Typography variant="h5">My Seats</Typography>
        {seats.map((seat, index) => (
          <Stack
            sx={{
              backgroundColor: "black",
              color: "white",
            }}
            gap={1}
            key={index}
          >
            <Typography>Section: {seat.section}</Typography>
            <Typography>Row: {seat.row}</Typography>
            <Typography>Number: {seat.number}</Typography>
            <Typography>
              Is Reserved: {seat.isReserved ? "true" : "false"}
            </Typography>
            <Typography>
              Is Reservable: {seat.isReservable ? "true" : "false"}
            </Typography>
            <Typography>
              ReservedBy: {seat.reservedBy ? seat.reservedBy.name : "N/A"}
            </Typography>
            <Typography>
              RedeemedTicket:{" "}
              {seat.redeemedTicket ? seat.redeemedTicket.number : "N/A"}
            </Typography>
            <Typography>
              Venue: {seat.venue ? seat.venue.name : "N/A"}
            </Typography>
          </Stack>
        ))}
        <Button variant="contained" onClick={handleDownload}>
          Export to CSV
        </Button>
      </Stack>
    </Container>
  );
};

interface CanvasPageState {
  // Define any state needed for the component
}

export default SeatsPlaygroundPage;

// Data Fetching
export const getServerSideProps = (async (context) => {
  const seats = await getAllFormatedSeats();

  return {
    props: { seats },
  };
}) satisfies GetServerSideProps;
