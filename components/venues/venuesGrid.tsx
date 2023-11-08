import { Venue } from "@/models/venue";
import { Box, Grid, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

const VenuesGrid: FC<VenuesGridProps> = ({ city }) => {
  return (
    <Grid item container spacing={3} textAlign="center" my={5}>
      {city.venues.map((venue) => (
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          key={venue.slug.current}
          position="relative"
          textAlign={"center"}
          alignItems={"center"}
          justifyContent={"center"}
          mb={2}
        >
          <Box width={360} height={240} position="relative">
            <Link href={`/venues/${venue.slug.current}`}>
              <Image
                src={venue.image.asset.url}
                alt={venue.name}
                width={360}
                height={240}
              />
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
                p={5}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: "#fff" }}
                >
                  {venue.name}
                </Typography>
              </Box>
            </Link>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default VenuesGrid;

// Type Definitions
interface VenuesGridProps {
  city: City;
}

interface City {
  name: string;
  slug: string;
  image: any;
  venues: Venue[];
}
