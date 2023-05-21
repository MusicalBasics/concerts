"use client";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { useLayoutEffect, useRef, useState } from "react";
import styles from "./Map.module.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoidHo5MjQiLCJhIjoiY2xoc2dnemo5MDdqZTN0bDNtOTg1eXA3OCJ9.CCj0nebLyXpIn9JfHc02qQ";

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      projection: "globe",
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [lng, lat],
      zoom: zoom,
    });

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

    const marker = new mapboxgl.Marker({
      color: "#FF0000", // Marker color
      scale: 1.5, // Marker size
      rotation: 45, // Marker rotation (in degrees)
    })
      .setLngLat([-74.006, 40.7128]) // NYC coordinates
      .addTo(map.current);

    return () => map.current.remove();
  }, []);

  return <div ref={mapContainer} className={styles.mapContainer} />;
}
