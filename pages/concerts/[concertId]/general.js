import axios, { HttpStatusCode } from "axios";
import {
  Box,
  Stack,
  Typography,
  ToggleButton,
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
import { sanityClient } from "@/utils/sanity";
import { useRouter } from "next/router";

import Layout from "@/components/layout";
import SeatPicker from "@/components/seat-picker";
import { toSeatsText, getFormattedDate } from "@/utils/concert-utils";
import RegularButton from "@/components/concerts/regular-button";
import EmailInput from "@/components/concerts/email-input";
import NameInput from "@/components/concerts/name-input";
import TicketsInput from "@/components/concerts/tickets-input";
import {
  validateName,
  validateEmail,
  validateTicketNumbers,
} from "@/utils/concert-utils";
import Link from "next/link";

export default function GenerelTicketPage({ concert }) {
  const router = useRouter();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [ticketCount, setTicketCount] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [ticketNumbers, setTicketNumbers] = useState("");
  const [ticketIds, setTicketIds] = useState([]);

  const venue = concert.venue;
  const concertId = concert._id;
  const seatingChart = concert.seatingChart;

  const [loading, setLoading] = useState(false);

  // If there are no ticket numbers, available seats is 0, otherwise it's the number of tickets
  const [showMap, setShowMap] = useState(false);

  const handleToggle = () => {
    setShowMap((prev) => !prev);
  };

  const handleNameInputChange = (event) => {
    setName(event.target.value);
  };

  const handleEmailInputChange = (event) => {
    setEmail(event.target.value);
  };

  const handleTicketsInputChange = (event) => {
    setTicketNumbers(event.target.value);
  };

  const handleDialogClose = () => {
    setIsVerified(false);
    setReservationSuccess(false);
    setSelectedSeats([]);
    setName("");
    setEmail("");
    setTicketNumbers("");
    setTicketCount(0);
    setTicketIds([]);

    router.replace(router.asPath);
    return;
  };

  const handleSubmitTickets = async () => {
    if (!name || !email || !ticketNumbers) {
      alert("Please fill out all fields!");
      return;
    }

    if (!validateName(name) || !validateEmail(email)) {
      alert("Please enter valid name and email!");
      return;
    }

    if (!validateTicketNumbers(ticketNumbers)) {
      alert("Please enter valid ticket number(s)!");
      return;
    }
    const ticketNumberArray = ticketNumbers.split("\n");
    const ticketNumberSet = new Set(ticketNumberArray);
    const uniqueTicketNumbers = [...ticketNumberSet];

    setLoading(true);

    try {
      const response = await axios.post("/api/checkTickets", {
        name,
        email,
        concertId,
        ticketNumbers: uniqueTicketNumbers,
      });

      if (response.status !== HttpStatusCode.Ok) {
        alert("There was an error checking the tickets.");
        return;
      }

      const data = response.data;

      if (!data.success) {
        alert("There was an error checking the tickets.");
        return;
      }

      const { totalTicketCount, ticketIds } = data;

      if (totalTicketCount === 0) {
        alert("No valid tickets.");
        setLoading(false);
        return;
      }

      console.log(`Found ${totalTicketCount} tickets for ${email}.`);
      console.log(`Ticket IDs: ${ticketIds}`);

      setTicketIds(ticketIds); // Update state with the found ticket IDs
      setTicketCount(totalTicketCount);
      setIsVerified(true); // set isVerified to true once ticket numbers are verified
    } catch (error) {
      console.error(error);
      alert("There was an error checking the tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (selectedSeats) => {
    setLoading(true);
    try {
      const reserveRes = await axios.post("/api/reserveGeneral", {
        concertId,
        name,
        email,
        ticketIds,
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

      <Link href={`/concerts/${concert._id}`}>
        <Stack textAlign="center" my={2} spacing={1}>
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
          <Stack alignItems="center" justifyContent="center" spacing={2}>
            <NameInput value={name} onChange={handleNameInputChange} />
            <EmailInput value={email} onChange={handleEmailInputChange} />
            <Stack>
              <Typography>Please enter your ticket number(s).</Typography>
              <Typography variant="caption" mb={1}>
                One number per row
              </Typography>
              <TicketsInput
                value={ticketNumbers}
                onChange={handleTicketsInputChange}
              />
            </Stack>
            <Box mt={3}>
              <RegularButton onClick={handleSubmitTickets}>
                Submit
              </RegularButton>
            </Box>
          </Stack>
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
