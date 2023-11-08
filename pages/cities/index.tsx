import * as mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { MAPBOX_ACCESS_TOKEN } from "@/constants/api";
import { Box, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { FC } from "react";
import Layout from "@/components/layout";
import Image from "next/image";
import { GetStaticProps } from "next";
import { sanityClient } from "@/utils/sanity";
import _ from "lodash";
import City from "@/models/city";

mapboxgl!.accessToken = MAPBOX_ACCESS_TOKEN;

const CitiesPage: FC<CitiesPageProps> = ({ cities }) => {
  // Use MUI Box component to wrap the content
  return (
    <Layout>
      <Grid container textAlign="center" my={5}>
        {cities.map((city) => {
          return (
            <Grid
              key={city.id}
              container
              item
              xs={12}
              sm={6}
              md={4}
              position="relative"
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Image
                src={city.image.asset.url}
                alt={city.name}
                width={360}
                height={240}
              />
              <Link href={`/cities/${city.slug.current}`}>
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    opacity: 0,
                    transition: "opacity 0.3s",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: "bold", color: "#fff" }}
                  >
                    {city.name}
                  </Typography>
                </Box>
              </Link>
            </Grid>
          );
        })}
      </Grid>
    </Layout>
  );
};

export default CitiesPage;

export const getStaticProps = (async (context) => {
  // Pull data from sanity
  const citiesQuery = `*[_type == "city"] {
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

  if (!citiesData.length) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      cities: citiesData,
    },
  };
}) satisfies GetStaticProps<CitiesPageProps>;

// Type Definitions
interface CitiesPageProps {
  cities: City[];
}
