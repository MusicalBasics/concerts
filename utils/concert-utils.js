import axios from "axios";
import moment from "moment";
import _ from "lodash";
import { sanityClient } from "./sanity";

export const toSeatsText = (seats) => {
  return seats.map((seat) => `${seat.rowId}${seat.seatNumber}`).join(", ");
};

export const getFormattedDate = (date) => {
  return moment(date).format("MMMM Do YYYY").toString();
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name) => {
  // Make sure name is not empty and less than 50 characters
  return name.length > 0 && name.length < 50;
};

export const validateTicketNumbers = (ticketNumbers) => {
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
    ticketNumberRegex.test(ticketNumber)
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
      }
    }
  `;

  try {
    const concerts = await sanityClient.fetch(query);

    const groupedConcerts = _.groupBy(concerts, (concert) => {
      const formattedStartDate = moment(concert.startDate).format("MMM YYYY");
      const formattedEndDate = moment(concert.endDate).format("MMM YYYY");
      return `${formattedStartDate} - ${formattedEndDate}`;
    });

    const sortedGroups = _(groupedConcerts)
      .toPairs()
      .orderBy((pair) => new Date(pair[0].split(" - ")[0]), ["asc"])
      .fromPairs()
      .value();

    const cityLinks = Object.keys(sortedGroups).map((dateRange) => ({
      dateRange,
      cities: sortedGroups[dateRange].map((concert) => ({
        name: concert.city.name,
        link: `/concerts/${concert._id}`,
      })),
    }));

    return cityLinks;
  } catch (error) {
    console.error("Error:", error);
  }
};
