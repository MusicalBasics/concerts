import React, { useState } from "react";
import { getCity } from "@/data/cities";
import { Box, Button, Stack, Typography, TextField } from "@mui/material";
import Layout from "@/components/layout";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Redeem({ city }) {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const handleInputChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async () => {
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
          cityId: city.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
        return;
      }

      const data = await response.json();

      if (data.ticketCount === 0) {
        alert("No tickets found for this email.");
        return;
      }

      // TODO Redirect to the seat picker page
      console.log(`Found ${data.ticketCount} tickets for ${email}.`);

      router.push(`/pick/${city.id}`);
    } catch (error) {
      console.error(error);
      alert("There was an error checking the email.");
    }
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
      </Stack>
      <Stack textAlign="center">
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
            onClick={handleSubmit}
            disabled={!city.concert?.venue}
          >
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
