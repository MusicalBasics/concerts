import React, { useState } from "react";
import { getCity } from "@/data/cities";
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  IconButton,
} from "@mui/material";
import Layout from "@/components/layout";
import Image from "next/image";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useRouter } from "next/router";

export default function Redeem({ city }) {
  const router = useRouter();

  const [ticketCount, setTicketCount] = useState(1);
  const [ticketNumbers, setTicketNumbers] = useState([""]);

  const handleIncrement = () => {
    if (ticketCount < 8) {
      setTicketCount(ticketCount + 1);
      setTicketNumbers([...ticketNumbers, ""]);
    }
  };

  const handleDecrement = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
      setTicketNumbers(ticketNumbers.slice(0, -1));
    }
  };

  const handleInputChange = (index, event) => {
    const newTicketNumbers = [...ticketNumbers];
    newTicketNumbers[index] = event.target.value;
    setTicketNumbers(newTicketNumbers);
  };

  const handleSubmit = () => {
    // 1. Check for duplicate ticket numbers
    const hasDuplicates =
      new Set(ticketNumbers.filter((ticket) => ticket)).size !==
      ticketNumbers.filter((ticket) => ticket).length;

    if (hasDuplicates) {
      alert("Duplicate ticket numbers are not allowed.");
      return;
    }

    // 2. Check the first three digits of each ticket number
    const paddedCityId = String(city.id).padStart(3, "0");
    const hasInvalidCityId = ticketNumbers.some(
      (ticket) => ticket.slice(0, 3) !== paddedCityId
    );

    if (hasInvalidCityId) {
      alert(
        "One or more ticket numbers do not match the city ID. Please check your input."
      );
      return;
    }

    // 3. Check if the ticket numbers have exactly 9 digits
    const hasInvalidLength = ticketNumbers.some(
      (ticket) => ticket.length !== 9
    );

    if (hasInvalidLength) {
      alert("All ticket numbers must have exactly 9 digits.");
      return;
    }

    // TODO 4. Check if the ticket numbers are valid, check against the database

    // If both validations pass, proceed with desired action
    console.log("Valid tickets. Proceeding...");
    const ticketQueryString = ticketNumbers.join(",");
    router.push(`/pick/${city.id}?tickets=${ticketQueryString}`);
  };

  return (
    <Layout>
      <Stack textAlign="center" my={5} spacing={1}>
        <Box p={2}>
          <Image src={`/images/${city.image}`} width={360} height={240} />
        </Box>
        <Typography variant="h4">{city.concert?.venue}</Typography>
        <Typography variant="body">{city.concert?.address}</Typography>
        <Typography variant="caption">{city.concert?.date}</Typography>
        <Box mt={5}>
          <IconButton
            onClick={handleDecrement}
            color="secondary"
            aria-label="Reduce ticket number"
          >
            <RemoveCircleOutlineIcon />
          </IconButton>
          <IconButton
            onClick={handleIncrement}
            color="secondary"
            aria-label="Increase ticket number"
          >
            <AddCircleOutlineIcon />
          </IconButton>
        </Box>
        {ticketNumbers.map((ticketNumber, index) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 2,
              mb: 2,
            }}
            key={index}
          >
            <TextField
              value={ticketNumber}
              onChange={(event) => handleInputChange(index, event)}
              variant="outlined"
              color="secondary"
              label={`Ticket Number ${index + 1}`}
              sx={{ width: 300, borderRadius: 4 }}
            />
          </Box>
        ))}
        <Box mt={3}>
          <Button variant="contained" color="secondary" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Stack>
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

  return {
    props: {
      city,
    },
  };
}
