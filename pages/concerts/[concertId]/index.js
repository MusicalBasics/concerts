import { createClient } from "next-sanity";
import axios, { HttpStatusCode } from "axios";
import {
  Box,
  Stack,
  Typography,
  ToggleButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import Image from "next/image";
import moment from "moment";
import { useRouter } from "next/router";

import Layout from "@/components/layout";
import SeatPicker from "@/components/seat-picker";
import { toSeatsText, getFormattedDate } from "@/utils/concert-utils";

export default function Pick({ concert }) {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState([]);

  const city = concert.city;
  const venue = concert.venue;
  const seatingChart = concert.seatingChart;

  const [ticketCount, setTicketCount] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // If there are no ticket numbers, available seats is 0, otherwise it's the number of tickets
  const [showMap, setShowMap] = useState(false);

  const handleToggle = () => {
    setShowMap((prev) => !prev);
  };

  const handleInputChange = (event) => {
    setEmail(event.target.value);
  };

  const handleDialogClose = () => {
    setIsVerified(false);
    setReservationSuccess(false);
    setSelectedSeats([]);
    router.replace(router.asPath);
    return;
  };

  const handleSubmitEmail = async () => {
    setLoading(true);
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      setLoading(false);
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

      if (data.totalTicketCount === 0) {
        alert("No tickets found for this email.");
        setLoading(false);
        return;
      }

      // console.log(`Found ${data.totalTicketCount} tickets for ${email}.`);
      const customer = data.customers[0];

      // Update state with the found customer data
      setIsVerified(true); // set isVerified to true once email is verified and name is pulled
      setTicketCount(data.totalTicketCount);
      setName(customer.name);
      setEmail(customer.email); // This line will overwrite the email state with the email from the customer document
    } catch (error) {
      console.error(error);
      alert("There was an error checking the email.");
    }
    setLoading(false);
  };

  const handleReserve = async (selectedSeats) => {
    setLoading(true);
    try {
      const reserveRes = await axios.post("/api/reserve", {
        concertId: concert._id,
        name,
        email,
        selectedSeats,
      });

      if (reserveRes.data.success) {
        setReservationSuccess(true);
      } else {
        alert("There was an error reserving your seats.");
      }

      // Send confrimation eamils
      const emailResponse = await axios.post("/api/sendConfirmation", {
        email,
        concertName: concert.name,
        concertDate: getFormattedDate(concert.date),
        seats: toSeatsText(selectedSeats),
      });

      if (emailResponse.status !== HttpStatusCode.Ok) {
        console.log("There was an error sending the confirmation email.");
      }

      alert("Confirmation email sent.");
    } catch (error) {
      console.error(error);
      alert("There was an error reserving your seats.");
    }
    setLoading(false);
  };

  // Use MUI Box component to wrap the content
  return (
    <Layout>
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional: for a semi-transparent background
          }}
        >
          <CircularProgress color="secondary" />
        </Box>
      )}

      <Stack textAlign="center" my={5} spacing={1}>
        <Box p={2}>
          <Image src={city.image.asset.url} width={360} height={240} />
        </Box>
        <Typography variant="h4">{venue.name}</Typography>
        <Typography variant="body">{venue.address}</Typography>
        <Typography variant="caption">
          {moment(concert.date).format("YYYY/MM/DD")}
        </Typography>
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
                sx={{
                  width: 300,
                  borderRadius: 4,
                  "& label": { color: "white" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "white" },
                    "&:hover fieldset": { borderColor: "white" },
                    "&.Mui-focused fieldset": { borderColor: "white" },
                  },
                }}
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
            onSubmit={handleReserve}
            selectedSeats={selectedSeats}
            setSelectedSeats={setSelectedSeats}
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

      {reservationSuccess && (
        <Dialog open={reservationSuccess} onClose={handleDialogClose}>
          <DialogTitle>Congratulations!</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You are all set. You have selected seats{" "}
              <b>{toSeatsText(selectedSeats)}</b>
              <Stack spacing={2}>
                <Typography variant="body1">
                  You will receive an email confirming your seat selections to{" "}
                  {email}.
                </Typography>
                <Typography variant="body1">
                  You will receive the tickets from the
                  <b>{` ${venue.name} `}</b>
                  once we have processed it on our end. Please stay updated.
                </Typography>
              </Stack>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Layout>
  );
}

// CMS
const client = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2022-03-25",
  useCdn: false,
});

// Data Fetching
export async function getStaticProps(context) {
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
    revalidate: 300,
  };
}
