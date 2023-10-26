import { Box, Button, Stack } from "@mui/material";
import { useState } from "react";
import CityListItem from "./city-list-item.js";
import styles from "./concert-list.module.css";
import _ from "lodash";
import { useMap } from "react-map-gl";

export const HQ = [-115.1398, 36.1699];

export default function CityList({ concerts }) {
  const [selectedCity, setSelectedCity] = useState(null);
  const { current: map } = useMap();

  return (
    <Box overflow={{ xs: "scroll" }} height={{ xs: "60vh" }}>
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
          We Are One / Lionel Yu World Tour
        </Button>
        {_.orderBy(concerts, (c) => c.city.id).map((concert) => {
          const city = concert.city;
          return (
            <CityListItem
              key={city.id}
              concert={concert}
              isSelected={selectedCity === city.id}
              onSelect={(id) => {
                setSelectedCity(id);
                map.flyTo({
                  center: city.coordinates,
                  zoom: 10,
                  essential: true, // this animation is considered essential with respect to prefers-reduced-motion
                });
              }}
              isSoldOut={concert.preorder.isSoldOut}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
