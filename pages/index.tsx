import CityList from "@/components/city-list";
import { MAPBOX_ACCESS_TOKEN } from "@/constants/api";
import { Box, Container } from "@mui/material";
import { FC } from "react";
import styles from "./index.module.css";
import RootLayout from "@/components/root-layout";
import ResponsiveAppBar from "@/components/app-bar";
import Subscribe from "@/components/subscribe";
import { GetStaticProps } from "next";
import { sanityClient } from "@/utils/sanity";
import _ from "lodash";
import { Map } from "react-map-gl";
import { Concert } from "@/models/Concert";
import { parseDateOrFallback } from "@/utils/datetime-utils";

const HomePage: FC<HomePageProps> = ({ concerts }) => {
  return (
    <RootLayout>
      <Box
        // ref={mapContainer}
        // className={styles.mapContainer}
        width="100%"
        height="100vh"
        // overflow={"hidden"}
      >
        <Map
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle={"mapbox://styles/mapbox/outdoors-v12"}
          initialViewState={{
            longitude: -74.006,
            latitude: 40.7128,
            zoom: 2,
          }}
          style={{ zIndex: 0 }}
          fog={{
            range: [0.8, 8],
            color: "rgb(186, 210, 235)", // Lower atmosphere
            "high-color": "rgb(36, 92, 223)", // Upper atmosphere
            "horizon-blend": 0.05, // Atmosphere thickness (default 0.2 at low zooms)
            "space-color": "rgb(0,0,0)", // Background color
            "star-intensity": 0.8, // Background star brightness (default 0.35 at low zooms)
          }}
        >
          <ResponsiveAppBar />
          <Container maxWidth="xl" className={styles.contentContainer}>
            <CityList concerts={concerts} />
            <Subscribe />
          </Container>
        </Map>
      </Box>
    </RootLayout>
  );
};

export default HomePage;

export const getStaticProps = (async () => {
  // Get all concerts from Sanity
  const concertsQuery = `*[_type == "concert"] {
    _id,
    name,
    slug,
    date,
    buyLink,
    city->{
      _id,
      id,
      name,
      coordinates,
      slug,
    },
    preorder {
      isSoldOut,
      timeFrame,
      startDate,
      endDate,
    },
  }`;
  const concertsData = await sanityClient.fetch(concertsQuery);

  if (!concertsData.length) {
    return {
      props: {
        concerts: [],
      },
    };
  }

  // Use Lodash to sort the array
  const sortedConcerts = _.orderBy(
    concertsData,
    [
      (concert) => {
        // Pass the startDate directly from preorder
        return parseDateOrFallback(concert.date, concert.preorder.endDate);
      },
      (concert) => concert.city.id,
    ],
    ["asc", "asc"]
  );

  return {
    props: {
      concerts: sortedConcerts,
    },
    revalidate: 60,
  };
}) satisfies GetStaticProps<HomePageProps>;

// Type definitions
interface HomePageProps {
  concerts: Concert[];
}
