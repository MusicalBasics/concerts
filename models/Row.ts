import { Seat } from "./Seat";

export type Row = {
  _key?: string;
  id: string;
  seats: Seat[];
};

export type Rows = Row[];

export default Row;
