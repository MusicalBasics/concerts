import { Box, Button, Stack } from "@mui/material";
import { useState } from "react";
import ConcertsListItem from "./concerts-list-item.js";
import styles from "./concerts-list.module.css";
import { useMap } from "react-map-gl";

export const HQ = [-115.1398, 36.1699];

export default function ConcertsList({ concerts }) {
  const [selectedConcert, setSelectedConcert] = useState(null);
  const { concertsMap } = useMap();

  const flyTo = (options) => {
    concertsMap?.flyTo(options);
  };

  return (
    <Box overflow={{ xs: "scroll" }} height={{ xs: "60vh" }}>
      <Stack spacing={2} className={styles.container}>
        <Button
          variant="contained"
          onClick={() => {
            flyTo({
              center: HQ,
              zoom: 2,
            });
          }}
        >
          We Are One / Lionel Yu World Tour
        </Button>
        {concerts.map((concert) => {
          const city = concert.city;
          return (
            <ConcertsListItem
              key={concert._id}
              concert={concert}
              isSelected={selectedConcert === city.id}
              onSelect={(id) => {
                setSelectedConcert(id);
                flyTo({
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
