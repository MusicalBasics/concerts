import { Ticket } from "./ticket";

interface Customer {
  _id: string;
  name: string;
  email: string;
  tickets?: Ticket[];
}

export type { Customer };
