import { Milestone } from "./milestone";

interface Preorder {
  totalTickets: number;
  goldenTicketProduct: goldenTicketProduct;
  otherTicketProducts: { _ref: string }[];
  otherProducts: { _ref: string }[];
  isSoldOut: boolean;
  milestones: Milestone[];
  startDate: string;
  endDate: string;
  timeFrame: string;
}

type goldenTicketProduct = {
  store: {
    gid: string;
  };
};

export type { Preorder };
