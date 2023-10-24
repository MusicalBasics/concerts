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
import { useRouter } from "next/router";

import Layout from "@/components/layout";
import SeatPicker from "@/components/seat-picker";
import { toSeatsText, getFormattedDate } from "@/utils/concert-utils";
import { sanityClient } from "@/utils/sanity";
import GoldenButton from "@/components/concerts/golden-button";
import EmailInput from "@/components/concerts/email-input";
import Link from "next/link";

export default function GoldenTicketPage({ concert }) {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState([]);

  const venue = concert.venue;
  const seatingChart = concert.seatingChart;

  const [ticketCount, setTicketCount] = useState(0);
  const [ticketIds, setTicketIds] = useState([]); // This is an array of ticket IDs
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
    setEmail("");
    setName("");
    setLoading(false);
    setTicketCount(0);
    setTicketIds([]);
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
      // rewrite this to use axios
      const response = await axios.post("/api/checkEmail", {
        email,
        concertId: concert._id,
      });

      const data = response.data;

      if (response.status !== HttpStatusCode.Ok || !data.success) {
        setLoading(false);
        return;
      }

      const { totalTicketCount, ticketIds, customerName } = data;

      if (totalTicketCount === 0) {
        alert("No tickets found for this email.");
        setLoading(false);
        return;
      }

      // console.log(`Found ${totalTicketCount} tickets for ${email}.`);
      // console.log(`Ticket IDs: ${ticketIds}`);

      // Update state with the found customer data
      setIsVerified(true); // set isVerified to true once email is verified and name is pulled
      setEmail(email); // This line will overwrite the email state with the email from the customer document
      setName(customerName);
      setTicketCount(totalTicketCount);
      setTicketIds(ticketIds);
    } catch (error) {
      // Get the error message
      const { message } = error.response.data;
      alert(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  const handleReserve = async (selectedSeats) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/reserveGolden", {
        concertId: concert._id,
        name,
        email,
        selectedSeats,
        ticketIds,
      });

      const data = response.data;

      if (response.status !== HttpStatusCode.Ok || !data.success) {
        // Get error message from response
        const { message } = data;
        alert(`Error: ${message}`);
        setLoading(false);
        return;
      }

      setReservationSuccess(true);

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

      <Link href={`/concerts/${concert._id}`}>
        <Stack textAlign="center" my={5} spacing={1}>
          <Typography variant="h4">{venue.name}</Typography>
          <Typography>{venue.address}</Typography>
          <Typography variant="caption">
            {getFormattedDate(concert.date)}
          </Typography>
        </Stack>
      </Link>

      <Stack textAlign="center">
        {isVerified ? (
          <Box>
            <Typography variant="h4">Hello, {name}</Typography>
          </Box>
        ) : (
          <Box>
            <Typography>
              Please enter the email you used to purchase the Golden Ticket(s):
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <EmailInput value={email} onChange={handleInputChange} />
            </Box>
            <Box mt={3}>
              <GoldenButton onClick={handleSubmitEmail}>Submit</GoldenButton>
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
                  <b>{email}</b>.
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

// Data Fetching
export async function getServerSideProps(context) {
  // Get cityId from the URL
  const { concertId } = context.query;

  if (!concertId) {
    return {
      notFound: true,
    };
  }

  const concerts = await sanityClient.fetch(
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
