// import SeatingMap from "@/components/concerts/SeatingMaps";
import React, { FC, useState } from "react";
import dynamic from "next/dynamic";
import { sanityClient } from "@/utils/sanity";
import { GetServerSideProps } from "next";
import { Section } from "@/models/Section";
import { Container, Stack, Typography } from "@mui/material";
import _ from "lodash";
import { Concert } from "@/models/Concert";
import { getFormattedDate } from "@/utils/concert-utils";
import Row from "@/models/Row";

const SeatingMap = dynamic(
  () => import("@/components/seating-map/seating-map"),
  {
    ssr: false,
  }
);

interface CanvasPageProps {
  // Define any props needed for the component
  sections: Section[];
  concert: Concert;
}

const CanvasPage: FC<CanvasPageProps> = ({ sections, concert }) => {
  // Initialize state if needed
  const [state, setState] = useState<CanvasPageState>({
    // ...
  });

  // Define any necessary functions for the component
  const myFunction = (): void => {
    // ...
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
        <Typography variant="h2">{concert.name}</Typography>
        <Stack direction="row" gap={5} mb={5}>
          <Typography variant="h5">{getFormattedDate(concert.date)}</Typography>
          <Typography variant="h5">{concert.venue.name}</Typography>
        </Stack>
        <Typography variant="h4">Seating Map</Typography>
      </Stack>
      <SeatingMap sections={sections} curve={0.0005} />
      <Stack sx={{ color: "wheat" }} mt={5} gap={2} my={5}>
        <Typography variant="h3">Seats Reserved Without User</Typography>
        {sections.map((section, sectionIndex) => (
          <Stack key={sectionIndex} gap={1}>
            <Typography variant="h4">Section {sectionIndex + 1}</Typography>
            {section.rows.map((row, rowIndex) => (
              <Stack key={rowIndex}>
                <Typography variant="h5">Row {rowIndex + 1}</Typography>
                {getSeatsReservedWithoutUser(row).map((seat) => (
                  <Typography variant="h6" key={seat.number}>
                    {seat.number}
                  </Typography>
                ))}
              </Stack>
            ))}
          </Stack>
        ))}
      </Stack>
    </Container>
  );
};

interface CanvasPageState {
  // Define any state needed for the component
}

export default CanvasPage;

// Data Fetching
export const getServerSideProps = (async (context) => {
  const { concertId } = context.params!;

  const concerts = await sanityClient.fetch(
    `*[_type == "concert" && _id == $concertId]{
      _id,
      name,
      date,
      venue-> {
        _id,
        name,
        city-> {
          _id,
          name,
        },
      },
      seatingChart-> {
        _id,
        name,
      },
    }
  `,
    { concertId }
  );

  if (!concerts.length) {
    return {
      notFound: true,
    };
  }

  const concert = concerts[0];
  const { seatingChart } = concert;

  console.log("seatingChart", seatingChart);
  if (!seatingChart) {
    return {
      notFound: true,
    };
  }
  const seatingChartId = seatingChart._id;

  const seatingCharts = await sanityClient.fetch(
    `*[_type == "seatingChart" && _id == $seatingChartId]{
      sections[] {
        name,
        rows[] {
          id,
          seats[] {
            number,
            isReserved,
            isReservable,
            reservedBy-> {
              _id,
              name,
              email,
            },
          },
        },
      },
    }
  `,
    { seatingChartId }
  );

  if (!seatingCharts || seatingCharts.length === 0) {
    return {
      notFound: true,
    };
  }

  const { sections } = seatingCharts[0];

  return {
    props: {
      concert,
      sections, // now concert includes dereferenced city and venue
    },
  };
}) satisfies GetServerSideProps;
