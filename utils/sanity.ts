import { Customer } from "@/models/Customer";
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
