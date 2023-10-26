import * as mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { MAPBOX_ACCESS_TOKEN } from "@/constants/api";
import { Box, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { FC } from "react";
import Layout from "@/components/layout";
import Image from "next/image";
import { GetStaticPaths, GetStaticProps } from "next";
import { sanityClient } from "@/utils/sanity";
import _ from "lodash";
import { Venue } from "@/models/Venue";

mapboxgl!.accessToken = MAPBOX_ACCESS_TOKEN;

const VenuePage: FC<VenuePageProps> = ({ venue }) => {
  // Use MUI Box component to wrap the content
  return (
    <Layout>
      <Link href="/venues">ALL VENUES</Link>
      <Stack textAlign="center" my={5} spacing={1}>
        <Box p={2}>
          <Image
            src={venue.image.asset.url}
            alt={venue.name}
            width={360}
            height={240}
          />
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {venue.name}
        </Typography>
      </Stack>
    </Layout>
  );
};

export default VenuePage;

export const getStaticProps = (async (context) => {
  // Get cityId from the URL
  const { venueSlug } = context.params!;

  if (!venueSlug) {
    return {
      notFound: true,
    };
  }

  // Pull data from sanity
  // const concertsQuery = `*[_type == "concert" && city.slug.current == "${citySlug}"] {
  const citiesQuery = `*[_type == "venue" && slug.current == "${venueSlug}"] {
    _id,
    id,
    name,
    coordinates,
    slug,
    image {
      asset-> {
        url
      }
    },
  }`;
  const venues = await sanityClient.fetch(citiesQuery);

  console.log("venues", venues);

  if (!venues.length) {
    return {
      notFound: true,
    };
  }

  const venue = venues[0];

  // const inventoryTickets = await getInventory(city.productId);
  // console.log("inventoryTickets", inventoryTickets);
  // city.ticketsSold = city.totalTickets - inventoryTickets;

  return {
    props: {
      venue,
    },
  };
}) satisfies GetStaticProps;

export const getStaticPaths = (async () => {
  const venues: Venue[] = await sanityClient.fetch(
    `*[_type == "venue"]{
      slug,
    }
  `
  );

  return {
    paths: venues.map((venue) => ({
      params: {
        venueSlug: venue.slug.current,
      },
    })),
    fallback: false,
  };
}) satisfies GetStaticPaths;

// Type Definitions
interface VenuePageProps {
  venue: Venue;
}
