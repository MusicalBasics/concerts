import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import Milestones from "@/components/milestones";
import ResponsiveAppBar from "@/components/app-bar";
import VenueList from "@/components/venue-list";
import { MAPBOX_ACCESS_TOKEN } from "@/constants/api";
import { CITIES } from "@/data/cities";
import {
  Box,
  Button,
  Container,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

function getCity(id) {
  const city = CITIES.find((city) => city.id == id);
  return city;
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#232323",
    },
    secondary: {
      main: "#ffffff",
    },
  },
});

export default function City({ params }) {
  const { cityId } = params;
  const city = getCity(cityId);
  const coordinates = city.coordinates;

  const map = useRef(null);
  const mapContainer = useRef(null);
  const [lng, setLng] = useState(coordinates[0]);
  const [lat, setLat] = useState(coordinates[1]);
  const [zoom, setZoom] = useState(10);

  useLayoutEffect(() => {
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

  // TODO: Get sold from API
  const presales = 121;

  // Use MUI Box component to wrap the content
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="xl">
        <ResponsiveAppBar map={map} />
        <Stack
          textAlign="center"
          mt={5}
          sx={{
            color: "white",
          }}
        >
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
          <Typography variant="body">Current Presales: {presales}</Typography>
        </Stack>
        <Box mt={3} mb={3} textAlign="center">
          <Link href={city.link}>
            <Button variant="outlined" color="secondary">
              Buy Tickets
            </Button>
          </Link>
        </Box>
        <Milestones venues={city.venues} presales={presales} />
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} width="100%">
          <Box ref={mapContainer} sx={{ flex: 1, minHeight: 300 }} />
          <VenueList venues={city.venues} map={map} sx={{ flex: 1 }} />
        </Stack>
      </Container>
    </ThemeProvider>
  );
}

export async function getStaticPaths() {
  const paths = CITIES.map((city) => ({
    params: { cityId: city.id.toString() },
  }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  return { props: { params } };
}