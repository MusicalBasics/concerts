import { Box, Grid, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { FC } from "react";
import Layout from "@/components/layout";
import Image from "next/image";
import { GetStaticProps } from "next";
import { sanityClient } from "@/utils/sanity";
import _ from "lodash";
import { Venue } from "@/models/Venue";
import VenuesGrid from "@/components/venues/venuesGrid";

const VenuesPage: FC<VenuesPageProps> = ({ cities }) => {
  // Use MUI Box component to wrap the content
  return (
    <Layout>
      {cities.map((city) => {
        return (
          <Box key={city.slug} textAlign={"center"}>
            <Typography variant="h3">{city.name}</Typography>
            <VenuesGrid city={city} />
          </Box>
        );
      })}
    </Layout>
  );
};

export default VenuesPage;

export const getStaticProps = (async (context) => {
  // Pull data from sanity
  const venuesQuery = `*[_type == "venue"] {
    slug,
    _id,
    id,
    name,
    coordinates,
    image {
      asset-> {
        url
      }
    },
    city-> {
      id,
      name,
      slug,
      image {
        asset-> {
          url
        }
      },
    },
  }`;

  const venues = await sanityClient.fetch(venuesQuery);

  // Group venues by city
  const groupedByCity = _.groupBy(venues, (venue) => venue.city.name);

  // Transform to desired structure
  const cities = Object.keys(groupedByCity).map((cityName) => ({
    name: cityName,
    slug: groupedByCity[cityName][0].city.slug,
    image: groupedByCity[cityName][0].city.image,
    venues: groupedByCity[cityName],
    id: groupedByCity[cityName][0].city.id,
  }));

  if (!cities.length) {
    return {
      notFound: true,
    };
  }

  const sortedCities = _.orderBy(cities, ["id"], ["asc"]);

  return {
    props: {
      cities: sortedCities,
    },
  };
}) satisfies GetStaticProps<VenuesPageProps>;

// Type Definitions
interface VenuesPageProps {
  cities: City[];
}

interface City {
  name: string;
  slug: string;
  image: any;
  venues: Venue[];
}
