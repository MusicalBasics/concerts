import { StatusCodes } from "http-status-codes";

export async function shopifyFetch({ query, variables }) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const key = process.env.SHOPIFY_ADMIN_PRIVATE_ACCESS_TOKEN;
  const endpoint = `${domain}/admin/api/2023-04/graphql.json`;

  // console.log("endpoint", endpoint);
  // console.log("key", key);

  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": key,
      },
      body: { query, variables } && JSON.stringify({ query, variables }),
    });

    // DEBUG
    // console.log("result", result);

    return {
      status: result.status,
      body: await result.json(),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: "Error receiving data",
    };
  }
}

export async function getInventory(productId) {
  const query = `{
    product(id: "gid://shopify/Product/${productId}") {
      totalInventory
    }
  }`;

  const { status, body } = await shopifyFetch({ query });

  if (status === StatusCodes.OK) {
    return body.data.product.totalInventory;
  } else {
    return null;
  }
}
