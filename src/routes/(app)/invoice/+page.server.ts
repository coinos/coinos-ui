import getRates from "$lib/rates";
import type { Invoice } from "$lib/types";
import { auth, post } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";

export const load = async ({ cookies, parent, url }) => {
  const aid = url.searchParams.get("aid") || cookies.get("aid");
  if (aid) cookies.set("aid", aid, { path: "/", maxAge: 86400, httpOnly: false });
  let { subject, user } = await parent();

  const lnurl = url.searchParams.has("lnurl");
  if (lnurl) {
    redirect(307, `/invoice/lnurl`);
  }

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

  if (invoice.memoPrompt && !invoice.memo) {
    redirect(307, `/invoice/${id}/memo`);
  } else redirect(307, `/invoice/${id}`);
};
