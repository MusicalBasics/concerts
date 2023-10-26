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
  // const map = useRef<
  //   | (mapboxgl.Map & {
  //       setFog: any;
  //       setPadding: any;
  //     })
  //   | null
  // >(null);
  // const mapContainer = useRef<string | HTMLElement | null>(null);
  // const markers = useRef([]);
  // const [lng, setLng] = useState(coordinates[0]);
  // const [lat, setLat] = useState(coordinates[1]);
  // const [zoom, setZoom] = useState(10);

  // console.log("Current sold:", city.ticketsSold);

  // useEffect(() => {
  //   if (map.current) return; // initialize map only once
  //   map.current = new mapboxgl.Map({
  //     container: mapContainer.current!,
  //     style: "mapbox://styles/mapbox/navigation-night-v1",
  //     center: [lng, lat],
  //     zoom: zoom,
  //     attributionControl: false,
  //   });

  //   // Disable user interactions
  //   map.current.dragPan.disable();
  //   map.current.scrollZoom.disable();
  //   map.current.boxZoom.disable();
  //   map.current.dragRotate.disable();
  //   map.current.keyboard.disable();
  //   map.current.doubleClickZoom.disable();
  //   map.current.touchZoomRotate.disableRotation();

  //   return () => map.current!.remove();
  // }, []);

  // useEffect(() => {
  //   if (!map.current) return; // wait for map to initialize

  //   // Remove previous markers
  //   markers.current.forEach((marker) => marker.remove());
  //   markers.current = [];

  //   // Add markers for all venues
  //   city.venues.forEach((venue) => {
  //     const marker = new mapboxgl.Marker()
  //       .setLngLat(venue.coordinates)
  //       .setPopup(
  //         new mapboxgl.Popup().setHTML(
  //           `
  //         <div style="color: black;">
  //         <h3>${venue.name}</h3>
  //         <p>${venue.address}</p>
  //         <p>${venue.threshold} minimum</p>
  //         </div>
  //         `
  //         )
  //       )
  //       .addTo(map.current!);

  //     markers.current.push(marker);
  //     venue.marker = marker;
  //   });

  //   // Update the map center
  //   map.current.flyTo({
  //     center: [lng, lat],
  //     zoom: zoom,
  //   });
  // }, [city, lng, lat, zoom]);

  // Use MUI Box component to wrap the content
  return (
    <Layout>
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
          // onClick={() => {
          //   map.current.flyTo({
          //     center: coordinates,
          //     zoom: zoom,
          //     essential: true, // this animation is considered essential with respect to prefers-reduced-motion
          //   });
          // }}
        >
          {city.name}
        </Typography>
      </Stack>
      {/* <Box mt={3} mb={3} textAlign="center">
        <Link href={buyLink}>
          <Button size="large" variant="outlined" color="secondary">
            Buy Tickets
          </Button>
        </Link>
      </Box> */}
      {/* <Milestones venues={city.venues} presales={city.ticketsSold} /> */}
      {/* <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        width="100%"
        mb={10}
        display="flex"
      >
        <Box ref={mapContainer} sx={{ flex: 1, minHeight: 300 }} />
        <VenueList venues={city.venues} map={map} sx={{ flex: 1 }} />
      </Stack> */}
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
