import { Row } from "./row";

export type Section = {
  _key?: string;
  name: string;
  rows: Row[];
};

export type Sections = Section[];

export default Section;
