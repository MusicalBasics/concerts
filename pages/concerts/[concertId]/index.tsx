import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { GetStaticPaths, GetStaticProps } from "next";

import { getFormattedDate } from "@/utils/concert-utils";
import { sanityClient } from "@/utils/sanity";
import GoldenButton from "@/components/concerts/golden-button";
import RegularButton from "@/components/concerts/regular-button";
import Layout from "@/components/layout";

const ConcertPage: React.FC<ConcertPageProps> = ({ concert }) => {
  const { venue, _id: concertId } = concert;

  return (
    <Layout>
      <Stack textAlign="center" my={2} spacing={1}>
        <Typography variant="h3">{concert.name}</Typography>
        <Box p={1}>
          <Image
            src={venue.image.asset.url}
            alt={venue.name}
            width={360}
            height={240}
          />
        </Box>
        <Typography variant="h4">{venue.name}</Typography>
        <Typography>{venue.address}</Typography>
        <Typography variant="caption">
          {getFormattedDate(concert.date)}
        </Typography>
        <Box p={1} />
        <Typography>Select Your Ticket Type</Typography>
        <Stack direction="row" justifyContent="center" spacing={2}>
          <Link href={`/concerts/${concertId}/golden`}>
            <GoldenButton>Golden</GoldenButton>
          </Link>
          <Link href={`/concerts/${concertId}/general`}>
            <RegularButton>General</RegularButton>
          </Link>
        </Stack>
      </Stack>
    </Layout>
  );
};

export default ConcertPage;

// Data Fetching
export const getStaticProps = (async (context) => {
  const { concertId } = context.params!;

  if (!concertId) {
    return {
      notFound: true,
    };
  }

  const concerts = await sanityClient.fetch(
    `*[_type == "concert" && _id == "${concertId}"]{
      _id,
      name,
      city->{
        name,
        image {
          asset-> {
            url
          }
        },
        _id
      },
      venue->{
        name,
        address,
        image {
          asset-> {
            url
          }
        },
        _id
      },
      date,
    }
  `,
    { concertId }
  );

  if (!concerts || concerts.length === 0) {
    return {
      notFound: true,
    };
  }

  const concert = concerts[0];

  return {
    props: {
      concert, // now concert includes dereferenced city and venue
    },
    revalidate: 300,
  };
}) satisfies GetStaticProps<ConcertPageProps>;

export const getStaticPaths = (async () => {
  const concerts = await sanityClient.fetch(
    `*[_type == "concert"]{
      _id
    }
  `
  );

  const paths = concerts.map((concert: Concert) => ({
    params: { concertId: concert._id },
  }));

  return {
    paths,
    fallback: false,
  };
}) satisfies GetStaticPaths;

// Types
interface Concert {
  _id: string;
  name: string;
  city: {
    name: string;
    image: {
      asset: {
        url: string;
      };
    };
    _id: string;
  };
  venue: {
    name: string;
    address: string;
    image: {
      asset: {
        url: string;
      };
    };
    _id: string;
  };
  date: string;
}

interface ConcertPageProps {
  concert: Concert;
}
