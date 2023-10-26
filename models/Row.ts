import { Seat } from "./Seat";

export type Row = {
  id: string;
  seats: Seat[];
};

export type Rows = Row[];

export default Row;
