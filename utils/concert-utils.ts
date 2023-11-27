import moment from "moment-timezone";
import _ from "lodash";
import { sanityClient } from "./sanity";
import { Seat } from "@/models/seat";

export const toSeatsText = (seats: Seat[]) => {
  return seats.map((seat) => `${seat.row}${seat.number}`).join(", ");
};

export const getFormattedDate = (date: string) => {
  return moment(date).format("MMMM Do YYYY").toString();
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name: string) => {
  // Make sure name is not empty and less than 50 characters
  return name.length > 0 && name.length < 50;
};

export const validateTicketNumbers = (ticketNumbers: string) => {
  if (!ticketNumbers || ticketNumbers.trim().length === 0) {
    return false;
  }

  const ticketNumberArray = ticketNumbers.split("\n");

  if (ticketNumberArray.length === 0) {
    return false;
  }

  const ticketNumberSet = new Set();

  for (const ticketNumber of ticketNumberArray) {
    if (ticketNumber.trim().length === 0) {
      continue;
    }
    ticketNumberSet.add(ticketNumber.trim());
  }

  if (ticketNumberSet.size === 0) {
    return false;
  }

  // At least one string
  const cleanedTicketNumbers = Array.from(ticketNumberSet);

  // Regex to check if each digit is a number and it's 9 digits long
  const ticketNumberRegex = /^\d{9}$/;

  // Check if each ticket number is valid
  const isValid = cleanedTicketNumbers.every((ticketNumber) =>
    ticketNumberRegex.test(ticketNumber as any)
  );

  return isValid;
};

export const getCityLinks = async () => {
  const query = `
    *[_type == "concert"]{
      _id,
      "startDate": preorder.startDate,
      "endDate": preorder.endDate,
      city->{
        name,
        "slug": slug.current
      },
      buyLink,
      preorder{
        isSoldOut
      }
    }
  `;

  try {
    const concerts = await sanityClient.fetch(query);

    const groupedConcerts = _.groupBy(concerts, (concert) => {
      const formattedStartDate = moment(new Date(concert.startDate)).format(
        "MMM YYYY"
      );
      const formattedEndDate = moment(new Date(concert.endDate)).format(
        "MMM YYYY"
      );
      return `${formattedStartDate} - ${formattedEndDate}`;
    });

    const sortedGroups = _(groupedConcerts)
      .toPairs()
      .orderBy((pair) => new Date(pair[0].split(" - ")[0]), ["asc"])
      .fromPairs()
      .value();

    const cityLinks = Object.keys(sortedGroups).map((dateRange) => {
      return {
        dateRange,
        cities: sortedGroups[dateRange].map((concert) => {
          const { buyLink } = concert;
          const { isSoldOut } = concert.preorder;
          // const link = isSoldOut ? buyLink : `/concerts/${concert._id}`;
          const link = `/concerts/${concert._id}`;

          return {
            name: concert.city.name,
            link,
          };
        }),
      };
    });

    return cityLinks;
  } catch (error) {
    console.error("Error:", error);
  }
};

export const toConcertDate = (date: string, timeZone: string): string => {
  const dateMoment = moment(date).tz(timeZone);
  const formattedDate = dateMoment.format("dddd, MMMM Do YYYY");
  const formattedTime = dateMoment.format("H:mm z");
  return `${formattedDate}, ${formattedTime}`;
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
