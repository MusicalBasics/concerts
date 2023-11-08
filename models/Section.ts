import { Row } from "./row";

interface Section {
  _key?: string;
  name: string;
  rows: Row[];
}

export type { Section };
