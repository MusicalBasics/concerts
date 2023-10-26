import { sanityClient } from "@/utils/sanity";
import { GetStaticProps } from "next";
import React, { FC } from "react";
import _, { orderBy } from "lodash";

const CheckTicketsPage: FC<CheckTicketsPageProps> = ({ duplicateTickets }) => {
  return (
    <div
      style={{
        color: "white",
      }}
    >
      <h1>Check Tickets</h1>
      <ul>
        {duplicateTickets.map((ticket) => (
          <li key={ticket.number}>
            {ticket.number}: {ticket.ids.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CheckTicketsPage;

export const getStaticProps = (async () => {
  const duplicateTickets = await findDuplicateTickets();

  return {
    props: { duplicateTickets },
  };
}) satisfies GetStaticProps;

async function findDuplicateTickets() {
  try {
    const query = '*[_type == "ticket"]{number, _id}';
    const tickets = await sanityClient.fetch(query);
    const groupedTickets = _.groupBy(tickets, "number");
    const duplicates: DuplicateTicket[] = [];
    _.forEach(groupedTickets, (ticketGroup, number) => {
      if (ticketGroup.length > 1) {
        const ids = ticketGroup.map((ticket) => ticket._id);
        duplicates.push({ number, ids });
      }
    });

    return _.orderBy(duplicates, "number");
  } catch (error: any) {
    console.error("Error fetching tickets:", error.message);
  }
}

// Type Definitions
interface DuplicateTicket {
  number: string;
  ids: string[];
}
interface CheckTicketsPageProps {
  duplicateTickets: DuplicateTicket[];
}
