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
import { Map, MapProvider } from "react-map-gl";
import { parseDateOrFallback } from "@/utils/concert-utils";

interface HomepageConcert {
  _id: string;
  name: string;
  slug?: { current: string };
  date: string;
  timeZone: string;
  status: string;
  buyLink: string;
  livestreamLink?: string;
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
  livestreamLink: "https://belgium.musicalbasics.com/#livestream",
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
      <MapProvider>
        <Box width="100%" height="100vh" position="relative">
          {MAPBOX_ACCESS_TOKEN && (
            <Box
              sx={{ position: "absolute", inset: 0, zIndex: 0 }}
            >
              <Map
                id="concertsMap"
                mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                mapStyle={"mapbox://styles/mapbox/outdoors-v12"}
                initialViewState={{
                  longitude: -74.006,
                  latitude: 40.7128,
                  zoom: 2,
                }}
                fog={{
                  range: [0.8, 8],
                  color: "rgb(186, 210, 235)",
                  "high-color": "rgb(36, 92, 223)",
                  "horizon-blend": 0.05,
                  "space-color": "rgb(0,0,0)",
                  "star-intensity": 0.8,
                }}
              />
            </Box>
          )}

          <ResponsiveAppBar />
          <Container maxWidth="xl" className={styles.contentContainer}>
            <ConcertsList concerts={concerts} />
            <Subscribe />
          </Container>
        </Box>
      </MapProvider>
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
    livestreamLink,
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

  // Drop concerts that have already happened (1-day buffer for ongoing day-of
  // shows) plus anything not in a current status or marked as a test.
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const filteredConcerts = sortedConcerts.filter((concert) => {
    const concertTime = parseDateOrFallback(
      concert.date,
      concert.preorder.endDate
    ).getTime();
    return (
      concertTime >= cutoff &&
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
