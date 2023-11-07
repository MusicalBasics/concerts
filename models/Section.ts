import { Row } from "./Row";

export type Section = {
  _key?: string;
  sectionName: string;
  rows: Row[];
};
