import { Milestone } from "./milestone";

export type Preorder = {
  totalTickets: number;
  goldenTicketProduct: goldenTicketProduct;
  otherTicketProducts: { _ref: string }[];
  otherProducts: { _ref: string }[];
  isSoldOut: boolean;
  milestones: Milestone[];
  startDate: string;
  endDate: string;
  timeFrame: string;
};

export default Preorder;

type goldenTicketProduct = {
  store: {
    gid: string;
  };
};
