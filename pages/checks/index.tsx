import { Stack } from "@mui/material";
import Link from "next/link";

type ChecksProps = {
  children: React.ReactNode;
};

const Checks = ({ children }: ChecksProps) => {
  return (
    <Stack>
      <Link href="/checks/check-concerts">Check Concerts</Link>
      <Link href="/checks/check-customers">Check Customers</Link>
      <Link href="/checks/check-tickets">Check Tickets</Link>
    </Stack>
  );
};

export default Checks;
