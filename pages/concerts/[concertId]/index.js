import { createClient } from "next-sanity";
import {
  Box,
  Stack,
  Typography,
  ToggleButton,
  TextField,
  Button,
} from "@mui/material";
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
  const [ticketCount, setTicketCount] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // If there are no ticket numbers, available seats is 0, otherwise it's the number of tickets
  const [showMap, setShowMap] = useState(false);

  const handleToggle = () => {
    setShowMap((prev) => !prev);
  };

  const handleInputChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmitEmail = async () => {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("/api/checkEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          concertId: concert._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
        return;
      }

      const data = await response.json();

      if (data.length === 0) {
        alert("No tickets found for this email.");
        return;
      }

      // Assuming only one customer record is returned per email and concertId
      const customer = data[0];
      console.log(
        `Found ${customer.ticketCount} tickets for ${customer.email}.`
      );
      setIsVerified(true); // set isVerified to true once email is verified and name is pulled

      // Update state with the found customer data
      setTicketCount(customer.ticketCount);
      setName(customer.name);
      setEmail(customer.email); // This line will overwrite the email state with the email from the customer document
    } catch (error) {
      console.error(error);
      alert("There was an error checking the email.");
    }
  };

  const handleReserve = async (selectedSeats) => {
    try {
      const response = await axios.post("/api/reserve", {
        name,
        email,
        selectedSeats,
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

      <Stack textAlign="center">
        {isVerified ? (
          <Box>
            <Typography variant="h4">Hello, {name}</Typography>
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <TextField
                value={email}
                onChange={handleInputChange}
                type="email"
                variant="outlined"
                color="secondary"
                label="Email"
                sx={{ width: 300, borderRadius: 4 }}
              />
            </Box>
            <Box mt={3}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSubmitEmail}
              >
                Submit
              </Button>
            </Box>
          </Box>
        )}
      </Stack>

      {isVerified && (
        <Stack>
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
            onSubmit={handleSubmitEmail}
          />
        </Stack>
      )}

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
      _id,
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
