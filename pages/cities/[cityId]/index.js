import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import Milestones from "@/components/milestones";
import VenueList from "@/components/venue-list";
import { MAPBOX_ACCESS_TOKEN } from "@/constants/api";
import { getCity } from "@/data/cities";
import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/layout";
import { getInventory } from "@/utils/shopify-utils";
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export default function City({ city }) {
  const coordinates = city.coordinates;

  const map = useRef(null);
  const mapContainer = useRef(null);
  const [lng, setLng] = useState(coordinates[0]);
  const [lat, setLat] = useState(coordinates[1]);
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [lng, lat],
      zoom: zoom,
      attributionControl: false,
    });

    // Set isLoading to false when the map finishes loading
    map.current.on("load", () => {
      // manually add attribution control on the bottom-right
      map.current.addControl(new mapboxgl.AttributionControl(), "bottom-right");
    });

    // Add markers for all venues, simple markers
    city.venues.forEach((venue) => {
      const marker = new mapboxgl.Marker()
        .setLngLat(venue.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3>${venue.name}</h3><p>${venue.address}</p>`
          )
        )
        .addTo(map.current);
    });

    return () => map.current.remove();
  }, [city]);

  // Use MUI Box component to wrap the content
  return (
    <Layout>
      <Stack textAlign="center" mt={5}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={() => {
            map.current.flyTo({
              center: coordinates,
              zoom: zoom,
              essential: true, // this animation is considered essential with respect to prefers-reduced-motion
            });
          }}
        >
          {city.name}
        </Typography>
        <Typography variant="caption">{city.timeFrame}</Typography>
        <Typography variant="body">
          Current Presales: {city.ticketsSold}
        </Typography>
      </Stack>
      <Box mt={3} mb={3} textAlign="center">
        <Link href={city.link}>
          <Button variant="outlined" color="secondary">
            Buy Tickets
          </Button>
        </Link>
      </Box>
      <Milestones venues={city.venues} presales={city.ticketsSold} />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} width="100%">
        <Box ref={mapContainer} sx={{ flex: 1, minHeight: 300 }} />
        <VenueList venues={city.venues} map={map} sx={{ flex: 1 }} />
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

  const city = getCity(cityId);

  if (!city) {
    return {
      notFound: true,
    };
  }

  const inventoryTickets = await getInventory(city.productId);

  // DEBUG
  // console.log("inventoryTickets", inventoryTickets);

  city.ticketsSold = city.totalTickets - inventoryTickets;

  return {
    props: {
      city,
    },
  };
}
