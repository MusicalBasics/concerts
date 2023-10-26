import axios, { HttpStatusCode } from "axios";

export async function shopifyFetch({ query, variables }) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const key = process.env.SHOPIFY_ADMIN_PRIVATE_ACCESS_TOKEN;
  const endpoint = `${domain}/admin/api/2023-04/graphql.json`;

  try {
    const result = await axios.post(
      endpoint,
      { query, variables },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": key,
        },
      }
    );

    return {
      status: result.status,
      body: result.data,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      status: HttpStatusCode.InternalServerError,
      error: "Error receiving data",
    };
  }
}

export async function getInventory(productGid) {
  const query = `{
    product(id: "${productGid}") {
      totalInventory
    }
  }`;

  try {
    const { status, body } = await shopifyFetch({ query });

    const { product } = body.data;

    if (status != HttpStatusCode.Ok) {
      return null;
    }

    return product.totalInventory;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
