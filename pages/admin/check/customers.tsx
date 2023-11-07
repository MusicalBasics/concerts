import { sanityClient } from "@/utils/sanity";
import { GetServerSideProps, GetStaticProps } from "next";
import React, { FC } from "react";
import _, { orderBy } from "lodash";
import { useState } from "react";
import {
  Button,
  Container,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";

const CheckCustomersPage: FC<CheckCustomersPageProps> = ({
  duplicateCustomers,
}) => {
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (id: any) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        marginTop: "20px",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#000000",
        borderRadius: "10px",
        boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
        color: "white",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Check Customers
      </Typography>
      <List>
        {duplicateCustomers.length === 0 && (
          <ListItem>
            <Typography variant="h4">No duplicate customers found!</Typography>
          </ListItem>
        )}
        {duplicateCustomers.map((customer) => (
          <ListItem key={customer.email}>
            <Typography variant="h5">{customer.email}: </Typography>
            <Stack>
              {customer.ids.map((id) => (
                <Stack
                  direction={"row"}
                  spacing={2}
                  key={id}
                  p={1}
                  alignItems={"center"}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    onClick={() => copyToClipboard(id)}
                  >
                    {copiedId === id ? "Copied!" : "Copy"}
                  </Button>
                  <Typography variant="body1">{id}</Typography>
                </Stack>
              ))}
            </Stack>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default CheckCustomersPage;

export const getServerSideProps = (async () => {
  const duplicateCustomers = await findDuplicateCustomers();

  return {
    props: { duplicateCustomers },
  };
}) satisfies GetServerSideProps;

async function findDuplicateCustomers() {
  try {
    const query = '*[_type == "customer"]{email, _id}';
    const customers = await sanityClient.fetch(query);
    const groupedCustomers = _.groupBy(customers, "email");
    const duplicates: DuplicateCustomer[] = [];
    _.forEach(groupedCustomers, (customerGroup, email) => {
      if (customerGroup.length > 1) {
        const ids = customerGroup.map((customer) => customer._id);
        duplicates.push({ email, ids });
      }
    });

    return _.orderBy(duplicates, "number");
  } catch (error: any) {
    console.error("Error fetching customers:", error.message);
  }
}

// Type Definitions
interface DuplicateCustomer {
  email: string;
  ids: string[];
}
interface CheckCustomersPageProps {
  duplicateCustomers: DuplicateCustomer[];
}
