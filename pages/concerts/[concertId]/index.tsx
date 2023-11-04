import Milestones from "@/components/milestones";
import { MAPBOX_ACCESS_TOKEN } from "@/constants/api";
import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { FC, useState } from "react";
import Layout from "@/components/layout";
import { getInventory } from "@/utils/shopify-utils";
import Image from "next/image";
import FloatingCityList from "@/components/floating-city-list";
import { GetStaticPaths, GetStaticProps } from "next";
import { sanityClient } from "@/utils/sanity";
import _ from "lodash";
import { Concert } from "@/models/Concert";
import { getCityLinks } from "@/utils/concert-utils";
import { Map, Marker, Popup } from "react-map-gl";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import { toConcertDate } from "@/utils/datetime-utils";

const ConcertPage: FC<ConcertPageProps> = ({
  concert,
  ticketsSold,
  cityLinks,
}) => {
  const { city, preorder, buyLink } = concert;
  const { milestones } = preorder;
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const cityLink = `/cities/${city.slug.current}`;
  const dateText = preorder.isSoldOut
    ? toConcertDate(concert.date)
    : preorder.timeFrame;

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
          >
            {city.name}
          </Typography>
        </Link>
        <Typography variant="caption">{dateText}</Typography>
        {preorder.isSoldOut && (
          <Stack>
            <Typography>{concert.venue.name}</Typography>
            <Box p={1}>
              <Image
                src={concert.venue.image.asset.url}
                alt={concert.venue.name}
                width={300}
                height={200}
              />
            </Box>
          </Stack>
        )}
      </Stack>
      <Box mt={3} mb={3} textAlign="center">
        <Stack direction="row" spacing={2} justifyContent="center">
          <Link href={buyLink}>
            <Button size="large" variant="outlined" color="secondary">
              Buy Tickets
            </Button>
          </Link>
          {/* {preorder.isSoldOut && (
            <Link href={`/concerts/${concert._id}/redeem`}>
              <Button size="large" variant="outlined" color="secondary">
                Redeem Tickets
              </Button>
            </Link>
          )} */}
        </Stack>
      </Box>
      {!preorder.isSoldOut && (
        <Milestones milestones={milestones} presales={ticketsSold} />
      )}
      {!preorder.isSoldOut && (
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          width="100%"
          mb={10}
          display="flex"
        >
          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            width={"100%"}
          >
            <Map
              mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
              initialViewState={{
                longitude: city.coordinates.lng,
                latitude: city.coordinates.lat,
                zoom: 10,
              }}
              style={{ width: "100%", height: 400 }}
              // dark
              mapStyle={"mapbox://styles/mapbox/dark-v11"}
            >
              {milestones.map((milestone) => {
                const { venue } = milestone;
                const { coordinates } = venue;
                return (
                  <Marker
                    key={venue.name}
                    longitude={coordinates.lng}
                    latitude={coordinates.lat}
                    onClick={(e) => {
                      // If we let the click event propagates to the map, it will immediately close the popup
                      // with `closeOnClick: true`
                      e.originalEvent.stopPropagation();
                      setPopupInfo({
                        name: venue.name,
                        adress: venue.address,
                        longitude: coordinates.lng,
                        latitude: coordinates.lat,
                      });
                    }}
                  >
                    <TheaterComedyIcon color="info" />
                  </Marker>
                );
              })}
              {popupInfo && (
                <Popup
                  anchor="bottom"
                  longitude={Number(popupInfo.longitude)}
                  latitude={Number(popupInfo.latitude)}
                  onClose={() => setPopupInfo(null)}
                >
                  <Typography variant="h6" color={"primary"}>
                    {popupInfo.name}
                  </Typography>
                  <Typography color={"primary"}>{popupInfo.adress}</Typography>
                </Popup>
              )}
            </Map>
          </Box>
        </Stack>
      )}
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
    },
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
    revalidate: 60,
  };
}) satisfies GetStaticProps;

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
  cityLinks: any[];
}

interface PopupInfo {
  name: string;
  adress: string;
  longitude: number;
  latitude: number;
}
