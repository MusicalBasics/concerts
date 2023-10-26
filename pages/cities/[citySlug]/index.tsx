import * as mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import Milestones from "@/components/milestones";
import VenueList from "@/components/venue-list";
import { MAPBOX_ACCESS_TOKEN } from "@/constants/api";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import Layout from "@/components/layout";
import { getInventory } from "@/utils/shopify-utils";
import Image from "next/image";
import FloatingCityList from "@/components/floating-city-list";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import { sanityClient } from "@/utils/sanity";
import _ from "lodash";
import City from "@/models/city";

mapboxgl!.accessToken = MAPBOX_ACCESS_TOKEN;

const CityPage: FC<CityPageProps> = ({ city }) => {
  // Use MUI Box component to wrap the content
  return (
    <Layout>
      <Link href="/cities">ALL CITIES</Link>
      <Stack textAlign="center" my={5} spacing={1}>
        <Box p={2}>
          <Image
            src={city.image.asset.url}
            alt={city.name}
            width={360}
            height={240}
          />
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {city.name}
        </Typography>
      </Stack>
    </Layout>
  );
};

export default CityPage;

export const getStaticProps = (async (context) => {
  // Get cityId from the URL
  const { citySlug } = context.params!;

  if (!citySlug) {
    return {
      notFound: true,
    };
  }

  // Pull data from sanity
  // const concertsQuery = `*[_type == "concert" && city.slug.current == "${citySlug}"] {
  const citiesQuery = `*[_type == "city" && slug.current == "${citySlug}"] {
    slug,
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
  const citiesData = await sanityClient.fetch(citiesQuery);

  console.log("citiesData", citiesData);

  if (!citiesData.length) {
    return {
      notFound: true,
    };
  }

  const city = citiesData[0];

  // const inventoryTickets = await getInventory(city.productId);
  // console.log("inventoryTickets", inventoryTickets);
  // city.ticketsSold = city.totalTickets - inventoryTickets;

  return {
    props: {
      city,
    },
  };
}) satisfies GetStaticProps<CityPageProps>;

export const getStaticPaths = (async () => {
  const cities: City[] = await sanityClient.fetch(
    `*[_type == "city"]{
      slug,
    }
  `
  );

  return {
    paths: cities.map((city) => ({
      params: {
        citySlug: city.slug.current,
      },
    })),
    fallback: false,
  };
}) satisfies GetStaticPaths;

// Type Definitions
interface CityPageProps {
  city: City;
}
