import { Row } from "./row";

export type Section = {
  _key?: string;
  name: string;
  rows: Row[];
};
