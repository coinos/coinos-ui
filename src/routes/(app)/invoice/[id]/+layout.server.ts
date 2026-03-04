import getRates from "$lib/rates";
import { get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, depends, params, url, parent }) {
  depends("app:invoice");

  const token = cookies.get("token");
  let { subject, user } = await parent();
  const { id } = params;
  let invoice;

  if (id === "lnurl") {
    const rates = await getRates();
    invoice = {
      aid: user.id,
      uid: user.id,
      amount: 0,
      tip: 0,
      rate: rates[user?.currency || "USD"],
      text: "",
      hash: "",
      type: "lightning",
      items: [],
      memo: "",
      pending: 0,
      received: 0,
      user: { id: user.id, username: user.username, currency: user.currency },
    };
  } else if (id) {
    invoice = await get(`/invoice/${id}`);
    const options = !!url.searchParams.get("options");
    let { amount, pending, received } = invoice;
    amount = parseInt(amount);

    const paid =
      (!amount && (pending || received)) ||
      (amount > 0 && (pending >= amount || received >= amount));
    if (paid && !url.pathname.endsWith("paid")) {
      redirect(307, `/invoice/${id}/paid` + (options ? "?options=true" : ""));
    }

    subject = invoice.user;

    const aid = cookies.get("aid") || user?.id;
    if (
      user &&
      invoice.uid !== user?.id &&
      !(url.pathname.includes("tip") || url.pathname.includes("memo")) &&
      !options
    ) {
      if (invoice.prompt && invoice.tip === null) redirect(307, `/invoice/${id}/tip`);
      else {
        redirect(307, `/send/invoice/${id}`);
      }
    }
  }

  const theme = cookies.get("theme") || "light";
  return { id, invoice, subject, user, token, theme };
}
