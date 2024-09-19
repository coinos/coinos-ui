import { auth, post } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";
import type { Invoice } from "$lib/types";

export let load = async ({ cookies, parent }) => {
  let account_id = cookies.get("account_id");
  let { subject, user, rates } = await parent();

  let invoice: Invoice = {
    account_id,
    rate: rates[user?.currency || subject?.currency],
  };

  if (!user) user = subject;

  try {
    invoice = await post("/invoice", { invoice, account_id, user }, auth(cookies));
  } catch (e) {
    console.log(e);
    error(500, "Failed to generate invoice");
    }

  let { id } = invoice;

  if (invoice.memoPrompt && !invoice.memo) {
    redirect(307, `/invoice/${id}/memo`);
  } else redirect(307, `/invoice/${id}`);
};
