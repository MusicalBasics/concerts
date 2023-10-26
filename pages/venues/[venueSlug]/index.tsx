import { MAPBOX_ACCESS_TOKEN } from "@/constants/api";
import { Box, Icon, IconButton, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { FC } from "react";
import Layout from "@/components/layout";
import Image from "next/image";
import { GetStaticPaths, GetStaticProps } from "next";
import { sanityClient } from "@/utils/sanity";
import _ from "lodash";
import { Venue } from "@/models/Venue";
import { Map, Marker } from "react-map-gl";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const VenuePage: FC<VenuePageProps> = ({ venue }) => {
  // Use MUI Box component to wrap the content

  const { lat, lng } = venue.coordinates;

  return (
    <Layout>
      {/* <Link href="/venues">ALL VENUES</Link> */}
      <Stack textAlign="center" my={5} spacing={3}>
        <Box>
          <Image
            src={venue.image.asset.url}
            alt={venue.name}
            width={360}
            height={240}
          />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={"bold"}>
            {venue.name}
          </Typography>
          {/* address */}
          <Typography variant="body1">{venue.address}</Typography>
        </Box>
        <Box display={"flex"} justifyContent={"center"} alignItems={"center"}>
          <Map
            mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
            initialViewState={{
              longitude: lng,
              latitude: lat,
              zoom: 14,
            }}
            style={{ width: 600, height: 400 }}
            // dark
            mapStyle={"mapbox://styles/mapbox/dark-v11"}
          >
            <Marker longitude={lng} latitude={lat}>
              <LocationOnIcon color="error" fontSize="large" />
            </Marker>
          </Map>
        </Box>
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
  const venuesQuery = `*[_type == "venue" && slug.current == "${venueSlug}"] {
    _id,
    id,
    name,
    coordinates,
    address,
    slug,
    image {
      asset-> {
        url
      }
    },
  }`;
  const venues = await sanityClient.fetch(venuesQuery);

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
