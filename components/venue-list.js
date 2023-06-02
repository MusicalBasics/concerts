import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { MAPBOX_ACCESS_TOKEN } from "@/constants/api";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import styles from "./venue-list.module.css";
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export default function VenueList({ map, venues }) {
  return (
    <Box
      sx={{
        maxHeight: "500px", // Change this to your desired height
        overflowY: "auto",
      }}
    >
      <Stack spacing={2} className={styles.container}>
        {venues.map((venue) => (
          <Card key={venue.name} variant="outlined">
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: grey[500] }} aria-label="level">
                  L{venue.level}
                </Avatar>
              }
              title={venue.name}
              subheader={`${venue.threshold} tickets sold`}
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {venue.address}
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                key={venue.name}
                variant="outlined"
                onClick={() => {
                  map.current.flyTo({
                    center: venue.coordinates,
                    zoom: 15,
                    essential: true, // this animation is considered essential with respect to prefers-reduced-motion
                  });
                }}
              >
                Navigate
              </Button>
            </CardActions>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
