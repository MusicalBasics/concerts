import { Customer } from "@/models/Customer";
import { SeatingMap as SeatingChart } from "@/models/SeatingMap";
import { DuplicateTicket, Ticket } from "@/models/Ticket";
import _ from "lodash";
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

export async function findDuplicateRedemptions() {
  try {
    const redeemedTicketsQuery = `*[_type == "ticket" && redeemed == true]{
      _id,
      number,
      seat {
        short,
        section,
        row,
        number
      },
      concert->{
        seatingChart->{
          _id,
          sections[]{
            sectionName,
            rows[]{
              id,
              seats[]{
                number,
                isReserved,
                reservedBy->{
                  _id,
                  name,
                  email
                }
              }
            }
          }
        }
      }
    }`;
    const redeemedTickets: Ticket[] = await sanityClient.fetch(
      redeemedTicketsQuery
    );

    // Create a map to track the seats and their associated tickets
    const seatTicketMap: { [key: string]: Ticket[] } = {};

    // Iterate over each ticket to find their seat in the seating chart
    for (const ticket of redeemedTickets) {
      const seatingChart: SeatingChart = ticket.concert.seatingChart;
      for (const section of seatingChart.sections) {
        for (const row of section.rows) {
          for (const seat of row.seats) {
            // Check if the seat has a redeemed ticket
            if (seat.redeemedTicket === ticket._id) {
              // Create a unique identifier for the seat
              const seatIdentifier = `${seatingChart._id}-${section.sectionName}-${row.id}-${seat.number}`;

              if (!seatTicketMap[seatIdentifier]) {
                seatTicketMap[seatIdentifier] = [];
              }
              seatTicketMap[seatIdentifier].push(ticket);
            }
          }
        }
      }
    }

    // Find all seat identifiers with more than one associated ticket
    const duplicateRedemptions: any[] = Object.entries(seatTicketMap)
      .filter(([, tickets]) => tickets.length > 1) // Filter for seats with more than one ticket
      .map(([seatIdentifier, tickets]) => ({
        seatIdentifier,
        tickets,
      }));

    return duplicateRedemptions;
  } catch (error: any) {
    console.error(`Failed to find duplicate redemptions: ${error.message}`);
    throw error; // Rethrow the error to be handled by the caller
  }
}

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

  // TODO Check if any tickets are pointing to the same seat

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

async function getFilteredSeats() {
  const seatQuery = `
  *[_type == "seatingChart"]{
      _id,
      sections[]{
        sectionName,
        rows[]{
          id,
          seats[]{
            number,
            isReserved,
            redeemedTicket->{
              seat {
                short,
                section,
                row,
                number
              },
              customer->{
                _id,
                name,
                email
              }
            },
            reservedBy->{
              _id,
              name,
              email
            }
          }
        }
      }
    }
  `;
  try {
    const seatingCharts = await sanityClient.fetch(seatQuery);

    let filteredSeats: any[] = [];

    // Use lodash to iterate over the sections and rows
    _.forEach(seatingCharts, (chart) => {
      _.forEach(chart.sections, (section) => {
        _.forEach(section.rows, (row) => {
          // Filter the seats within the current row
          const seats = _.filter(
            row.seats,
            (seat) => seat.isReserved || seat.reservedBy || seat.redeemedTicket
          );
          // Map and keep necessary details
          const detailedSeats = _.map(seats, (seat) => ({
            ...seat,
            seatingChartId: chart._id,
            rowId: row.id,
            sectionName: section.sectionName,
          }));
          // Merge the detailed seats into the filteredSeats array
          filteredSeats = _.concat(filteredSeats, detailedSeats);
        });
      });
    });

    return filteredSeats;
  } catch (error) {
    console.error("Error fetching and filtering seats:", error);
    throw error;
  }
}
export const findMismatchedSeats = async () => {
  // Fetch all tickets with their seat
  const filteredSeats = await getFilteredSeats();

  let mismatches: any[] = [];

  filteredSeats.forEach((seat) => {
    if (seat.isReserved && seat.reservedBy) {
      if (!seat.redeemedTicket) {
        mismatches.push({
          seat,
          message: `Seat is reserved by someone but has no redeemedTicket`,
        });
      } else if (!seat.redeemedTicket.customer) {
        mismatches.push({
          seat,
          message: `Seat is reserved but has a redeemedTicket with no customer`,
        });
      } else if (seat.reservedBy._id !== seat.redeemedTicket.customer._id) {
        mismatches.push({
          seat,
          message: `Seat is reserved but has a reservedBy that doesn't match the redeemedTicket's customer`,
        });
      }
    }

    if (seat.isReserved && seat.redeemedTicket) {
      const { section, row, number } = seat.redeemedTicket.seat;
      if (
        seat.sectionName !== section ||
        seat.rowId !== row ||
        seat.number !== number
      ) {
        mismatches.push({
          seat,
          message: `Seat is reserved but has a redeemedTicket that doesn't match`,
        });
      }
    }

    if (!seat.isReserved && seat.reservedBy) {
      mismatches.push({
        seat,
        message: `Seat is not reserved but has a reservedBy`,
      });
    }

    if (!seat.isReserved && seat.redeemedTicket) {
      mismatches.push({
        seat,
        message: `Seat is not reserved but has a redeemedTicket`,
      });
    }
  });

  console.log("mismatches", mismatches);

  return mismatches;
};

export const getAllFormatedSeats = async () => {
  try {
    const seatingCharts: SeatingChart[] = await sanityAdminClient.fetch(
      `*[_type == "seatingChart"]{
        venue->{
          _id,
          name,
        },
        sections[] {
          name,
          rows[] {
            id,
            seats[] {
              number,
              isReserved,
              isReservable,
              row,
              section,
              reservedBy->{
                _id,
                name,
                email,
              },
              redeemedTicket->{
                _id,
                number,
              }, 
            },
          },
        },
      }
    `
    );

    let formatedSeats: FormatedSeat[] = [];

    if (!seatingCharts || seatingCharts.length === 0) {
      throw new Error("No seating charts found");
    }

    seatingCharts.forEach((seatingChart) => {
      seatingChart.sections.forEach((section) => {
        section.rows.forEach((row) => {
          row.seats.forEach((seat) => {
            formatedSeats.push({
              number: seat.number,
              isReserved: seat.isReserved,
              isReservable: seat.isReservable,
              redeemedTicket: seat.redeemedTicket,
              reservedBy: seat.reservedBy,
              venue: {
                name: seatingChart.venue.name,
                _ref: seatingChart.venue._id,
              },
              row: row.id,
              section: section.name,
            });
          });
        });
      });
    });

    return formatedSeats;
  } catch (error) {
    console.error("Error fetching and filtering seats:", error);
    throw error;
  }
};

export type FormatedSeat = {
  _key?: string;
  number: string;
  isReserved: boolean;
  isReservable: boolean;
  redeemedTicket: { _ref?: string; number?: string };
  reservedBy: { _ref?: string; name?: string; email?: string };
  venue: { _ref?: string; name?: string };
  row: string;
  section: string;
};
