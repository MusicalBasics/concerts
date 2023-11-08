export const isInvalidateTicket = (ticketNumber: string) => {
  return (
    !ticketNumber || ticketNumber.length !== 9 || !/^\d+$/.test(ticketNumber)
  );
};

export const isInvalidEmail = (email: string): boolean => {
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Test the email against the regex. If it doesn't match, it's invalid.
  return !emailRegex.test(email);
};
