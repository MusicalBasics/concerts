import * as mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import Milestones from "@/components/milestones";
import { MAPBOX_ACCESS_TOKEN } from "@/constants/api";
import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { FC } from "react";
import Layout from "@/components/layout";
import { getInventory } from "@/utils/shopify-utils";
import Image from "next/image";
import FloatingCityList from "@/components/floating-city-list";
import { GetStaticPaths, GetStaticProps } from "next";
import { sanityClient } from "@/utils/sanity";
import _ from "lodash";
import { Concert } from "@/models/Concert";
import { getCityLinks } from "@/utils/concert-utils";

mapboxgl!.accessToken = MAPBOX_ACCESS_TOKEN;

const ConcertPage: FC<ConcertPageProps> = ({
  concert,
  ticketsSold,
  cityLinks,
}) => {
  const { city, preorder, buyLink } = concert;

  const cityLink = `/cities/${city.slug.current}`;

  // const map = useRef<
  //   | (mapboxgl.Map & {
  //       setFog: any;
  //       setPadding: any;
  //     })
  //   | null
  // >(null);
  // const mapContainer = useRef<string | HTMLElement | null>(null);
  // const markers = useRef([]);
  // const [lng, setLng] = useState(coordinates[0]);
  // const [lat, setLat] = useState(coordinates[1]);
  // const [zoom, setZoom] = useState(10);

  // useEffect(() => {
  //   if (map.current) return; // initialize map only once
  //   map.current = new mapboxgl.Map({
  //     container: mapContainer.current!,
  //     style: "mapbox://styles/mapbox/navigation-night-v1",
  //     center: [lng, lat],
  //     zoom: zoom,
  //     attributionControl: false,
  //   });

  //   // Disable user interactions
  //   map.current.dragPan.disable();
  //   map.current.scrollZoom.disable();
  //   map.current.boxZoom.disable();
  //   map.current.dragRotate.disable();
  //   map.current.keyboard.disable();
  //   map.current.doubleClickZoom.disable();
  //   map.current.touchZoomRotate.disableRotation();

  //   return () => map.current!.remove();
  // }, []);

  // useEffect(() => {
  //   if (!map.current) return; // wait for map to initialize

  //   // Remove previous markers
  //   markers.current.forEach((marker) => marker.remove());
  //   markers.current = [];

  //   // Add markers for all venues
  //   city.venues.forEach((venue) => {
  //     const marker = new mapboxgl.Marker()
  //       .setLngLat(venue.coordinates)
  //       .setPopup(
  //         new mapboxgl.Popup().setHTML(
  //           `
  //         <div style="color: black;">
  //         <h3>${venue.name}</h3>
  //         <p>${venue.address}</p>
  //         <p>${venue.threshold} minimum</p>
  //         </div>
  //         `
  //         )
  //       )
  //       .addTo(map.current!);

  //     markers.current.push(marker);
  //     venue.marker = marker;
  //   });

  //   // Update the map center
  //   map.current.flyTo({
  //     center: [lng, lat],
  //     zoom: zoom,
  //   });
  // }, [city, lng, lat, zoom]);

  // Use MUI Box component to wrap the content
  return (
    <Layout>
      <FloatingCityList cityLinks={cityLinks} />
      <Stack textAlign="center" my={5} spacing={1}>
        <Box p={2}>
          <Image
            src={city.image.asset.url}
            alt={city.name}
            width={360}
            height={240}
          />
        </Box>
        <Link href={buyLink}>
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              cursor: "pointer",
            }}
            // onClick={() => {
            //   map.current.flyTo({
            //     center: coordinates,
            //     zoom: zoom,
            //     essential: true, // this animation is considered essential with respect to prefers-reduced-motion
            //   });
            // }}
          >
            {city.name}
          </Typography>
        </Link>
        <Typography variant="caption">{preorder.timeFrame}</Typography>
        <Typography>{/* Current Presales: {city.ticketsSold} */}</Typography>
      </Stack>
      <Box mt={3} mb={3} textAlign="center">
        <Link href={buyLink}>
          <Button size="large" variant="outlined" color="secondary">
            Buy Tickets
          </Button>
        </Link>
      </Box>
      <Milestones milestones={preorder.milestones} presales={ticketsSold} />
      {/* <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        width="100%"
        mb={10}
        display="flex"
      >
        <Box ref={mapContainer} sx={{ flex: 1, minHeight: 300 }} />
        <VenueList venues={city.venues} map={map} sx={{ flex: 1 }} />
      </Stack> */}
    </Layout>
  );
};

export default ConcertPage;

export const getStaticProps = (async (context) => {
  // Get cityId from the URL
  const { concertId } = context.params!;

  if (!concertId) {
    return {
      notFound: true,
    };
  }

  // Pull data from sanity
  const concertsQuery = `*[_type == "concert" && _id == $concertId] {
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
      image {
        asset-> {
          url
        }
      },
    },
    preorder {
      isSoldOut,
      timeFrame,
      totalTickets,
      milestones[] {
        level,
        threshold,
        venue-> {
          name,
          address,
          coordinates,
          slug,
          city-> {
            name,
            slug,
          },
          image {
            asset-> {
              url
            }
          },
        }
      },
      goldenTicketProduct-> {
        store {
          gid
        }
      },
    },
  }`;
  const concertsParams = {
    concertId,
  };
  const concertsData: Concert[] = await sanityClient.fetch(
    concertsQuery,
    concertsParams
  );

  console.log("concertsData", concertsData);

  if (!concertsData.length) {
    return {
      notFound: true,
    };
  }

  const concert = concertsData[0];

  const { totalTickets, goldenTicketProduct } = concert.preorder;
  const goldenTicketProductiGid = goldenTicketProduct.store.gid;

  const inventoryTickets = await getInventory(goldenTicketProductiGid);
  const ticketsSold = totalTickets - inventoryTickets;
  const cityLinks = await getCityLinks();

  return {
    props: {
      concert,
      ticketsSold,
      cityLinks,
    },
  };
}) satisfies GetStaticProps<ConcertPageProps>;

export const getStaticPaths = (async () => {
  const concerts: Concert[] = await sanityClient.fetch(
    `*[_type == "concert"]{
      _id,
    }
  `
  );

  return {
    paths: concerts.map((concert) => ({
      params: {
        concertId: concert._id,
      },
    })),
    fallback: false,
  };
}) satisfies GetStaticPaths;

// Type Definitions
interface ConcertPageProps {
  concert: Concert;
  ticketsSold: number;
  cityLinks: ReturnType<typeof getCityLinks>;
}
