// models/ticket.ts

import { Concert } from "./concert";
import { Customer } from "./customer";
import Seat from "./seat";

interface Ticket {
  _id?: string;
  assignedCustomerId?: string;
  number: string;
  concert: Concert;
  redeemed: boolean;
  type: string;
  customer: Customer;
  seat: Seat;
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
