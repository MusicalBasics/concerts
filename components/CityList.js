" use client";
import { CITIES, HQ } from "@/constants/cities";
import { Button, Stack } from "@mui/material";
import { useState } from "react";
import CityListItem from "./CityListItem";
import styles from "./ConcertList.module.css";

export default function CityList({ map }) {
  const [selectedCity, setSelectedCity] = useState(null);

  return (
    <Stack spacing={2} className={styles.container}>
      <Button
        variant="contained"
        onClick={() => {
          map.current.flyTo({
            center: HQ,
            zoom: 2,
          });
        }}
      >
        World
      </Button>
      {CITIES.map((city) => (
        <CityListItem
          key={city.id}
          city={city}
          isSelected={selectedCity === city.id}
          onSelect={(id) => {
            setSelectedCity(id);
            map.current.flyTo({
              center: city.coordinates,
              zoom: 10,
              essential: true, // this animation is considered essential with respect to prefers-reduced-motion
            });
          }}
        />
      ))}
    </Stack>
  );
}
