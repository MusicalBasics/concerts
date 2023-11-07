import { Button, Stack } from "@mui/material";
import Link from "next/link";

type ChecksProps = {
  children: React.ReactNode;
};

const Checks = ({ children }: ChecksProps) => {
  return (
    <Stack
      sx={{
        width: "100%",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
      spacing={4}
    >
      <Button variant="contained">
        <Link href="/admin/check/concerts" passHref>
          Check Concerts
        </Link>
      </Button>
      <Button variant="contained">
        <Link href="/admin/check/customers" passHref>
          Check Customers
        </Link>
      </Button>
      <Button variant="contained">
        <Link href="/admin/check/tickets" passHref>
          Check Tickets
        </Link>
      </Button>
    </Stack>
  );
};

export default Checks;
