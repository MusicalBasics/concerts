import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import CityList from "@/components/city-list";
import { MAPBOX_ACCESS_TOKEN } from "@/constants/api";
import { Box, Container } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import RootLayout from "@/components/root-layout";
import ResponsiveAppBar from "@/components/app-bar";
import Subscribe from "@/components/subscribe";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export default function HomePage() {
  const map = useRef(null);
  const mapContainer = useRef(null);
  const [lng, setLng] = useState(-74.006);
  const [lat, setLat] = useState(40.7128);
  const [zoom, setZoom] = useState(2);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [lng, lat],
      zoom: zoom,
      attributionControl: false,
    });

    // Set isLoading to false when the map finishes loading
    map.current.on("load", () => {
      setIsLoading(false);
      map.current.resize();
      map.current.setPadding({
        top: 0,
        right: 0,
        bottom: 0,
        left: 250,
      });

      // manually add attribution control on the bottom-right
      map.current.addControl(new mapboxgl.AttributionControl(), "bottom-right");

      // Set fog
      map.current.on("style.load", () => {
        map.current.setFog({
          color: "rgb(186, 210, 235)", // Lower atmosphere
          "high-color": "rgb(36, 92, 223)", // Upper atmosphere
          "horizon-blend": 0.02, // Atmosphere thickness (default 0.2 at low zooms)
          "space-color": "rgb(0,0,0)", // Background color
          "star-intensity": 0.8, // Background star brightness (default 0.35 at low zooms)
        });
      });
    });

    return () => map.current.remove();
  }, []);

  return (
    <RootLayout>
      <Box
        ref={mapContainer}
        className={styles.mapContainer}
        width="100%"
        height="100vh"
        overflow={"hidden"}
      ></Box>
      <ResponsiveAppBar />
      <Container maxWidth="xl" className={styles.contentContainer}>
        <CityList map={map} />
        <Subscribe />
      </Container>
    </RootLayout>
  );
}
