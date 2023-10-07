import Milestones from "@/components/milestones";
import { getCity } from "@/data/cities";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Layout from "@/components/layout";
import Image from "next/image";
import SeatPicker from "@/components/seat-picker";
import seatData from "@/data/seats.json";

export default function Seats({ sections, city }) {
  // Use MUI Box component to wrap the content
  return (
    <Layout>
      <Stack textAlign="center" my={5} spacing={1}>
        <Box p={2}>
          <Image src={`/images/${city.image}`} width={360} height={240} />
        </Box>
        <Typography variant="caption">{city.timeFrame}</Typography>
        <Typography variant="body">
          {/* Current Presales: {city.ticketsSold} */}
        </Typography>
      </Stack>

      <Box mt={10}>
        <SeatPicker sections={sections} />
      </Box>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  // Get cityId from the URL
  const { cityId } = context.query;

  if (!cityId) {
    return {
      notFound: true,
    };
  }

  // Use getCity function to obtain city data
  const city = getCity(cityId);

  if (!city) {
    return {
      notFound: true,
    };
  }

  // Find the seat data based on the cityId
  const seatCity = seatData.find((seatCity) => seatCity.cityId === cityId);

  if (!seatCity) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      city,
      sections: seatCity.sections, // Passing sections data to the component
    },
  };
}
