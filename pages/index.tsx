import ConcertsList from "@/components/concerts-list";
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
import { parseDateOrFallback } from "@/utils/concert-utils";

interface HomepageConcert {
  _id: string;
  name: string;
  slug?: { current: string };
  date: string;
  timeZone: string;
  status: string;
  buyLink: string;
  displayDate?: string;
  hideLearnMore?: boolean;
  city: {
    _id: string;
    id: string;
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    slug?: { current: string };
  };
  preorder: {
    isSoldOut: boolean;
    timeFrame: string;
    startDate?: string;
    endDate: string;
  };
}

const BELGIUM_CONCERT: HomepageConcert = {
  _id: "belgium-june-11-2026",
  name: "Belgium Concert",
  slug: { current: "belgium-june-11-2026" },
  date: "2026-06-11",
  timeZone: "Europe/Brussels",
  status: "upcoming",
  buyLink: "https://belgium.musicalbasics.com",
  displayDate: "June 11, 2026",
  hideLearnMore: true,
  city: {
    _id: "belgium",
    id: "belgium",
    name: "Belgium",
    coordinates: {
      lat: 50.5039,
      lng: 4.4699,
    },
    slug: { current: "belgium" },
  },
  preorder: {
    isSoldOut: true,
    timeFrame: "June 11, 2026",
    startDate: "2026-06-11",
    endDate: "2026-06-11",
  },
};

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
            <ConcertsList concerts={concerts} />
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
    timeZone,
    status,
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
        concerts: [BELGIUM_CONCERT],
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

  // Filter out test
  const filteredConcerts = sortedConcerts.filter((concert) => {
    return (
      (concert.status === "upcoming" ||
        concert.status === "ongoing" ||
        concert.status === "soldout") &&
      !concert.name.includes("Test")
    );
  });

  const homepageConcerts = _.orderBy(
    [...filteredConcerts, BELGIUM_CONCERT],
    [
      (concert) => {
        return parseDateOrFallback(concert.date, concert.preorder.endDate);
      },
      (concert) => concert.city.id,
    ],
    ["asc", "asc"]
  );

  return {
    props: {
      concerts: homepageConcerts,
    },
    revalidate: 60,
  };
}) satisfies GetStaticProps<HomePageProps>;

// Type definitions
interface HomePageProps {
  concerts: HomepageConcert[];
}
