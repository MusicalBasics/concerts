import { getCity } from "@/data/cities";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
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
  // TODO: get from query params
  const ticketNumbers = (router.query.tickets || "").split(",");
  const ticketCount = 0;

  // If there are no ticket numbers, available seats is 0, otherwise it's the number of tickets
  const [showMap, setShowMap] = useState(false);

  const handleToggle = () => {
    setShowMap((prev) => !prev);
  };

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

      <Box sx={{ my: 3, textAlign: "center" }}>
        <ToggleButton
          value={showMap}
          onChange={handleToggle}
          color="secondary"
          size="large"
          sx={{ color: "white", borderColor: "white" }}
        >
          {showMap ? "Hide Seating Map" : "Show Official Seating Map"}
        </ToggleButton>
      </Box>

      <SeatPicker
        sections={sections}
        ticketCount={ticketCount}
        onSubmit={handleSubmit}
      />

      {showMap && (
        <Box
          sx={{
            position: "fixed", // Fixed or absolute position
            top: 0, // Position from the top
            left: 0, // Position from the left
            width: "100%", // Full width
            height: "100%", // Full height
            bgcolor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background color
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000, // High z-index to ensure overlay is on top
          }}
        >
          <Box
            onClick={handleToggle} // Close overlay when clicking outside the image
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: -1, // Ensure click handler is behind image
            }}
          />
          <Image
            src="/images/nyc-venue-seating-map.png"
            width={800}
            height={617}
            alt="Seating Map"
          />
        </Box>
      )}
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
