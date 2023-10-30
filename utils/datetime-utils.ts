import moment from "moment";

export const toConcertDate = (date: any): string => {
  return moment(date).format("MMMM D, YYYY, h:mm a");
};
