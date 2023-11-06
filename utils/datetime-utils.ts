import moment from "moment";

export const toConcertDate = (date: any): string => {
  return moment(date).format("MMMM D, YYYY, h:mm a");
};

// Custom function to handle the date logic
export const parseDateOrFallback = (
  concertDate: string,
  preorderEndDate: string
) => {
  if (concertDate) {
    // Parse the provided date string
    return moment(concertDate).toDate();
  } else {
    // Since startDate is always provided, parse it assuming it's in the 'MMM YYYY' format
    // This will set the date to the first day of the specified month and year

    return moment(preorderEndDate, "MMM YYYY").endOf("month").toDate();
  }
};
