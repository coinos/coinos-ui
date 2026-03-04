import getRates from "$lib/rates";
import type { Invoice } from "$lib/types";
import { auth, post } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";

export const load = async ({ cookies, parent, url }) => {
  const aid = cookies.get("aid");
  let { subject, user } = await parent();

  const rates = await getRates();

  const type = url.searchParams.get("type") || undefined;
  const address_type = url.searchParams.get("address_type") || undefined;

  let invoice: Invoice = {
    aid: aid || "",
    rate: rates[user?.currency || subject?.currency],
    ...(type && { type }),
    ...(address_type && { address_type }),
  };

  if (!user) user = subject;

  try {
    invoice = await post("/invoice", { invoice, aid, user }, auth(cookies));
  } catch (e) {
    console.log(e);
    error(500, "Failed to generate invoice");
  }

  const { id } = invoice;

  const lnurl = url.searchParams.has("lnurl");

  if (invoice.memoPrompt && !invoice.memo) {
    redirect(307, `/invoice/${id}/memo`);
  } else redirect(307, `/invoice/${id}${lnurl ? "?lnurl=true" : ""}`);
};
