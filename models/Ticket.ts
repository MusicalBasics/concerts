// models/ticket.ts

import { Concert } from "./concert";
import { Customer } from "./customer";
import { Seat } from "./seat";
import { SeatingChart } from "./seating-chart";

interface Ticket {
  _id: string;
  concert: Concert;
  number: string;
  redeemed: boolean;
  type: string;
  seatingChart?: SeatingChart;
  customer?: Customer;
  redeemedSeat?: Seat;
  assignedCustomerId?: string;
}

interface DuplicateTicket {
  number: string;
  ids: string[];
}

interface MismatchedTicket {
  customerId: string;
  customerName: string;
  ticketId: string;
  ticketNumber: string;
  assignedCustomerId: string;
}

export type { Ticket, DuplicateTicket, MismatchedTicket };
