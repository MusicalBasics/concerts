import { getCity } from "@/data/cities";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Layout from "@/components/layout";
import Image from "next/image";
import SeatPicker from "@/components/seat-picker";
import seatData from "@/data/seats.json";
import { useRouter } from "next/router";

const name = "Lionel Yu";
const email = "lionel@musicalbasics.com";

export default function Pick({ sections, city }) {
  const router = useRouter();
  const ticketNumbers = (router.query.tickets || "").split(",");

  const handleSubmit = async (selectedSeats) => {
    try {
      const response = await axios.post("/api/reserve", {
        name,
        email,
        selectedSeats,
        cityId: city.id,
        ticketNumbers,
      });
      if (response.data.success) {
        alert("Seats reserved successfully!");
      } else {
        alert("There was an error reserving your seats.");
      }
    } catch (error) {
      console.error(error);
      alert("There was an error reserving your seats.");
    }
  };

  // Use MUI Box component to wrap the content
  return (
    <Layout>
      <Stack textAlign="center" my={5} spacing={1}>
        <Box p={2}>
          <Image src={`/images/${city.image}`} width={360} height={240} />
        </Box>
        <Typography variant="h4">{city.concert?.venue}</Typography>
        <Typography variant="body">{city.concert?.address}</Typography>
        <Typography variant="caption">{city.concert?.date}</Typography>
      </Stack>

      <SeatPicker
        sections={sections}
        ticketCount={ticketNumbers.length > 0 ? ticketNumbers.length : 1}
        onSubmit={handleSubmit}
      />
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
