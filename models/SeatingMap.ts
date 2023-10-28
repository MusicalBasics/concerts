import { Section } from "./Section";

export type SeatingMap = {
  _id: string;
  sections: Section[];
  referenceImage: { asset: { _ref: string } };
};
