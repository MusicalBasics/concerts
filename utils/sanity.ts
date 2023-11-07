import { Customer } from "@/models/Customer";
import { SeatingMap as SeatingChart } from "@/models/SeatingMap";
import { DuplicateTicket, Ticket } from "@/models/Ticket";
import { createClient } from "next-sanity";

export const sanityClient = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2022-03-25",
  useCdn: false,
});

export const sanityAdminClient = createClient({
  projectId: "zqcyefig",
  dataset: "production",
  apiVersion: "2023-03-01",
  token:
    "skHhHg8CnSmPV5G1Zduibkq2PKZ8HEqElBQofLLHNzojqu4n1zR8MBpkjdRbFNZuMvIEodoe2tWG7UkQLsuk6mjDnwHgrcdNlHQKFzPvhBosMLAwulZuyqWb37leLpSvHS9dEMo6Vbvg6rjSamY1J4IxIOMZCMo0PP2XghiyTvQNmV38r6ZH",
  useCdn: false, // Disable for authenticated requests
});

export async function resetSeat(
  seatingChartId: string,
  seactionName: string,
  rowId: string,
  seatNumber: string
) {
  // left-O-25
  console.log("seatingChartId", seatingChartId);
  // db1714bf-361a-4bf9-88a6-6950949dc532
  console.log("seactionName", seactionName);
  // left-O
  console.log("rowId", rowId);
  // 25
  console.log("seatNumber", seatNumber);

  try {
    const updatedSeatingChart = await sanityAdminClient
      .patch(seatingChartId)
      .set({
        [`sections[sectionName == \"${seactionName}\"].rows[id == \"${rowId}\"].seats[number == \"${seatNumber}\"].isReserved`]:
          false,
      })
      .unset([
        `sections[sectionName == \"${seactionName}\"].rows[id == \"${rowId}\"].seats[number == \"${seatNumber}\"].reservedBy`,
        `sections[sectionName == \"${seactionName}\"].rows[id == \"${rowId}\"].seats[number == \"${seatNumber}\"].redeemedTicket`,
      ])
      .commit({ autoGenerateArrayKeys: true });
    console.log("updatedSeatingChart", updatedSeatingChart);
    console.log(`Seat has been reset.`);
    return true;
  } catch (error: any) {
    console.error(`Failed to reset seat: ${error.message}`);
    return false;
  }
}

export async function findDuplicateTickets() {
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

export const findMismatchedTickets = async () => {
  // Fetch all customers with their tickets
  const customersWithTicketsQuery = `
    *[_type == "customer"]{
      _id,
      name,
      "tickets": tickets[]->{
        _id,
        number,
        "assignedCustomerId": customer->_id
      }
    }
  `;
  const customers: Customer[] = await sanityClient.fetch(
    customersWithTicketsQuery
  );

  // Fetch all tickets with their assigned customer
  const ticketsWithCustomerQuery = `
    *[_type == "ticket" && defined(customer)]{
      _id,
      number,
      customer->{
        _id,
        "tickets": tickets[]->_id
      }
    }
  `;
  const tickets = await sanityClient.fetch(ticketsWithCustomerQuery);

  let mismatches: any[] = [];

  // Check for tickets not listed under the customer's tickets
  customers
    .filter(
      (customer: Customer) => customer.tickets && customer.tickets.length > 0
    )
    .forEach((customer: Customer) => {
      customer.tickets!.forEach((ticket: Ticket) => {
        if (!customer.tickets!.some((t) => t._id === ticket._id)) {
          mismatches.push({
            customerId: customer._id,
            customerName: customer.name,
            ticketId: ticket._id,
            ticketNumber: ticket.number,
            message: `Ticket not found under customer's tickets`,
          });
        }
      });
    });

  // Check for customers not listed on their ticket's assigned customer
  tickets
    .filter(
      (ticket: Ticket) =>
        ticket.customer &&
        ticket.customer.tickets &&
        ticket.customer.tickets.length > 0
    )
    .forEach((ticket: any) => {
      if (!ticket.customer.tickets.includes(ticket._id)) {
        mismatches.push({
          ticketId: ticket._id,
          ticketNumber: ticket.number,
          assignedCustomerId: ticket.customer._id,
          message: `Customer's tickets do not include this ticket`,
        });
      }
    });

  return mismatches;
};

export async function findMismatchedRedemptions() {
  const redeemedTicketsQuery = `*[_type == "ticket" && redeemed == true]{
    _id,
    number,
    redeemed,
    seat {
      short,
      section,
      row,
      number
    },
    concert->{
      seatingChart->{
        _id,
        name,
        sections[]{
          sectionName,
          rows[]{
            id,
            seats[]{
              number,
              isReserved,
            }
          }
        }
      }
    }
  }`;
  // console.log("redeemedTicketsQuery", redeemedTicketsQuery);
  const redeemedTickets = await sanityAdminClient.fetch(redeemedTicketsQuery);
  const mismatchedSeats = [];

  for (const ticket of redeemedTickets) {
    if (ticket.seat?.short) {
      const { section, row, number } = ticket.seat;
      const seatInMap = await findSeatInSeatingChart(
        ticket.concert.seatingChart._id,
        section,
        row,
        number
      );

      if (
        !seatInMap ||
        seatInMap.section.sectionName !== section ||
        seatInMap.row.id !== row ||
        seatInMap.seat.number !== number
      ) {
        mismatchedSeats.push({
          redeemed: ticket.redeemed,
          ticketId: ticket._id,
          ticketNumber: ticket.number,
          expectedSeat: ticket.seat.short,
          foundSeat: seatInMap
            ? `${seatInMap.section.sectionName}-${seatInMap.row.id}${seatInMap.seat.number}`
            : "Not found",
        });
      }
    } else {
      // If there's no seat.short, it's a mismatch by default since the ticket is redeemed
      mismatchedSeats.push({
        redeemed: ticket.redeemed,
        ticketId: ticket._id,
        ticketNumber: ticket.number,
        expectedSeat: "N/A",
        foundSeat: "Not found",
      });
    }
  }

  // TODO Two way check from the other direction

  // Return or process the list of mismatchedSeats
  return mismatchedSeats;
}

async function findSeatInSeatingChart(
  seatingChartId: string,
  sectionName: string,
  rowId: string,
  seatNumber: string
) {
  // console.log("seatingChartId", seatingChartId);
  // console.log("sectionName", sectionName);
  // console.log("rowId", rowId);
  // console.log("seatNumber", seatNumber);

  // Define the GROQ query
  const query = `*[_type == "seatingChart" && _id == $seatingChartId]{
    sections[]{
      _key,
      sectionName,
      rows[]{
        _key,
        id,
        seats[]{
          _key,
          number
        }
      }
    }
  }[0]`;

  // Define the parameters for the query
  const params = {
    seatingChartId,
  };

  try {
    // Fetch the seating chart from Sanity
    const seatingChart: SeatingChart = await sanityClient.fetch(query, params);

    // Find the section
    const section = seatingChart.sections.find(
      (s) => s.sectionName === sectionName
    );
    if (!section) {
      console.error("Section not found");
      return null;
    }

    // Find the row within the section
    const row = section.rows.find((r) => r.id === rowId);
    if (!row) {
      console.error("Row not found");
      return null;
    }

    // Find the seat within the row
    const seat = row.seats.find((s) => s.number === seatNumber);
    if (!seat) {
      console.error("Seat not found");
      return null;
    }

    // console.log("Seat found:", seat);
    return { section, row, seat };
  } catch (error: any) {
    console.error(`Failed to find seat in seating map: ${error.message}`);
    return null;
  }
}
