// import SeatingMap from "@/components/concerts/SeatingMaps";
import React, { FC, useState } from "react";
import dynamic from "next/dynamic";
import { sanityClient } from "@/utils/sanity";
import { GetServerSideProps } from "next";
import { Section } from "@/models/Section";
import { Container } from "@mui/material";

const SeatingMap = dynamic(
  () => import("@/components/seating-map/seating-map"),
  {
    ssr: false,
  }
);

interface CanvasPageProps {
  // Define any props needed for the component
  sections: Section[];
}

const CanvasPage: FC<CanvasPageProps> = ({ sections }) => {
  console.log(sections);

  // Initialize state if needed
  const [state, setState] = useState<CanvasPageState>({
    // ...
  });

  // Define any necessary functions for the component
  const myFunction = (): void => {
    // ...
  };

  return (
    // Define the component's JSX
    <Container>
      <SeatingMap sections={sections} />
    </Container>
  );
};

interface CanvasPageState {
  // Define any state needed for the component
}

export default CanvasPage;

// Data Fetching
export const getServerSideProps = (async (context) => {
  const TEST_CONCERT_ID = "4f4b9063-70e7-457f-b4b4-8494eadb85c1";

  const concerts = await sanityClient.fetch(
    `*[_type == "concert" && _id == $concertId]{
      _id,
      seatingChart {
        sections[] {
          name,
          rows[] {
            id,
            seats[] {
              number,
              isReserved,
              isReservable,
              reservedBy-> {
                _id,
                name,
                email,
              },
            },
          },
        },
      },
    }
  `,
    { concertId: TEST_CONCERT_ID }
  );

  if (!concerts || concerts.length === 0) {
    return {
      notFound: true,
    };
  }

  const concert = concerts[0];
  const {
    seatingChart: { sections },
  } = concert;

  return {
    props: {
      sections, // now concert includes dereferenced city and venue
    },
  };
}) satisfies GetServerSideProps;
