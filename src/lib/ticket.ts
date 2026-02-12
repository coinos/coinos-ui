import { auth, get, post } from "$lib/utils";
import { env } from "$env/dynamic/private";
import tickets from "$lib/tickets";

export const createTicket = async (cookies, username) => {
  const { ticket } = await get("/ticket");

  const { address } = await post(
    `/${username}/invoice`,
    { invoice: { network: "liquid" }, user: { username } },
    auth(cookies),
  );

  const { asset } = await post(
    "/assets",
    {
      address,
      name: `Launch Party Ticket ${ticket}`,
      ticker: "LPT",
      precision: 0,
      asset_amount: "1",
      token_amount: 0,
      domain: "coinos.io",
      filename: tickets[ticket],
    },
    { authorization: `Bearer ${env.LAUNCH}` },
  );

  await post("/ticket", { asset }, { authorization: `Bearer ${env.LAUNCH}` });
  return asset;
};
