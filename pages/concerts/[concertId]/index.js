import { createClient } from "next-sanity";
import { Box, Stack, Typography, ToggleButton } from "@mui/material";
import { useState } from "react";
import Layout from "@/components/layout";
import Image from "next/image";
import SeatPicker from "@/components/seat-picker";
import { useRouter } from "next/router";


// 4f4b9063-70e7-457f-b4b4-8494eadb85c1

export default function Pick({ concert }) {
  const city = concert.city;
  const venue = concert.venue;
  const seatingChart = concert.seatingChart;

  console.log(city.image.asset.url);
  console.log(seatingChart.referenceImage);

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
          <Image src={city.image.asset.url} width={360} height={240} />
        </Box>
        <Typography variant="h4">{venue.name}</Typography>
        <Typography variant="body">{venue.address}</Typography>
        <Typography variant="caption">{concert.date}</Typography>
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
        sections={seatingChart.sections}
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
            src={seatingChart.referenceImage.asset.url}
            width={800}
            height={617}
            alt="Seating Map"
          />
        </Box>
      )}
    </Layout>
  );
}

const client = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2022-03-25",
  useCdn: false,
});

export async function getServerSideProps(context) {
  // Get cityId from the URL
  const { concertId } = context.query;

  if (!concertId) {
    return {
      notFound: true,
    };
  }

  const concerts = await client.fetch(
    `*[_type == "concert" && _id == "${concertId}"]{
      name,
      city->{
        name,
        image {
          asset-> {
            url
          }
        },
        _id
      },
      venue->{
        name,
        address,
        _id
      },
      date,
      seatingChart {
        sections[],
        referenceImage {
          asset-> {
            url
          }
        },
      },
    }
  `,
    { concertId }
  );

  console.log(concertId);

  if (!concerts || concerts.length === 0) {
    return {
      notFound: true,
    };
  }

  const concert = concerts[0];

  return {
    props: {
      concert, // now concert includes dereferenced city and venue
    },
  };
}
