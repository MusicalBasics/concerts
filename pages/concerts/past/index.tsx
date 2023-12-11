import { Box, Grid, Stack, Typography } from "@mui/material";
import { FC } from "react";
import Layout from "@/components/layout";
import { GetStaticProps } from "next";
import { getPastConcerts, sanityClient } from "@/utils/sanity";
import _ from "lodash";
import { Concert } from "@/models/concert";
import { toConcertDate } from "@/utils/concert-utils";

const PastConcertsPage: FC<PastConcertsPageProps> = ({ concerts }) => {
  // Use MUI Box component to wrap the content
  return (
    <Layout>
      <Grid container spacing={2}>
        {concerts.map((concert) => {
          return (
            <Grid key={concert._id} item xs={12}>
              <Box textAlign={"center"}>
                <Typography variant="h3">{concert.name}</Typography>
                <Typography variant="h5">
                  {concert.venue.name} - {concert.venue.address}
                </Typography>
                <Typography variant="h5">
                  {toConcertDate(concert.date, concert.timeZone)}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Layout>
  );
};

export default PastConcertsPage;

export const getStaticProps = (async (context) => {
  // Pull data from sanity
  const concerts = await getPastConcerts();

  if (!concerts.length) {
    return {
      notFound: true,
    };
  }

  const sortedConcerts = _.sortBy(concerts, (concert) => {
    return concert.date;
  });

  return {
    props: {
      concerts: sortedConcerts,
    },
  };
}) satisfies GetStaticProps<PastConcertsPageProps>;

// Type Definitions
interface PastConcertsPageProps {
  concerts: Concert[];
}
