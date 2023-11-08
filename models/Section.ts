import { Row } from "./Row";

export type Section = {
  _key?: string;
  name: string;
  rows: Row[];
};
