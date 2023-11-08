// import SeatingMap from "@/components/concerts/SeatingMaps";
import React, { FC, useState } from "react";
import dynamic from "next/dynamic";
import { sanityClient } from "@/utils/sanity";
import { GetServerSideProps } from "next";
import { Section } from "@/models/Section";
import { Button, Container, Grid, Stack } from "@mui/material";
import Link from "next/link";
import _ from "lodash";
import { Concert } from "@/models/Concert";
import { getFormattedDate } from "@/utils/concert-utils";
import { useRouter } from "next/router";

interface CheckConcertsPageProps {
  // Define any props needed for the component
  sections: Section[];
  concerts: Concert[];
}

const CheckConcertsPage: FC<CheckConcertsPageProps> = ({ concerts }) => {
  // Initialize state if needed

  // Define any necessary functions for the component
  const router = useRouter();

  return (
    // Define the component's JSX
    <Container>
      <Grid container spacing={2} gap={2} my={2}>
        {concerts.map((concert) => (
          <Grid
            item
            xs={12}
            md={5}
            key={concert._id}
            p={5}
            borderRadius={2}
            boxShadow="0px 0px 10px 0px rgba(0,0,0,0.75)"
          >
            <Stack
              sx={{
                color: "white",
              }}
              py={3}
              px={2}
              gap={1}
            >
              <h1>{concert.name}</h1>
              <p>{getFormattedDate(concert.date)}</p>
              <p>{concert.city.name}</p>
              <p>{concert.venue?.name || "No Venue"}</p>
            </Stack>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#000000",
                color: "white",
              }}
              disabled={!concert.seatingChart}
              onClick={() => {
                router.push(`${concert._id}`);
              }}
            >
              Check Concert
            </Button>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

interface CanvasPageState {
  // Define any state needed for the component
}

export default CheckConcertsPage;

// Data Fetching
export const getServerSideProps = (async (context) => {
  // const TEST_CONCERT_ID = "4f4b9063-70e7-457f-b4b4-8494eadb85c1";
  // const seatingChartId = "db1714bf-361a-4bf9-88a6-6950949dc532";

  const concerts = await sanityClient.fetch(
    `*[_type == "concert"]{
      _id,
      name,
      date,
      city-> {
        _id,
        name,
      },
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
  `
  );

  if (!concerts.length) {
    return {
      props: {
        sections: [],
      },
    };
  }

  const sortedConcerts = _.orderBy(
    concerts,
    [
      (concert) => {
        return concert.date ? new Date(concert.date) : 0;
      },
    ],
    ["desc"]
  );

  return {
    props: {
      concerts: sortedConcerts,
    },
  };
}) satisfies GetServerSideProps;
