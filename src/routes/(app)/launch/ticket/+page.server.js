import { get } from "$lib/utils";

export const load = async ({ cookies, parent }) => {
  let { user } = await parent();
  let tickets = await get("/tickets");
  let ticket = tickets.findIndex((t) =>
    user.accounts.find((a) => a.asset === t)
  );
  let asset = tickets[ticket];
  return { asset, ticket };
};
