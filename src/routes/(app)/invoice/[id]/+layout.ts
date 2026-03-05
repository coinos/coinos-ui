import { get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ params, url, parent, depends }) {
  depends("app:invoice");

  const { user, token, theme } = await parent();
  const { id } = params;
  let invoice;
  let subject;

  if (id === "lnurl") {
    subject = user;
    invoice = {
      aid: user.id,
      uid: user.id,
      amount: 0,
      tip: 0,
      rate: 0,
      text: `${user.username}@${url.host}`,
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

  let qrDataUrl: string | undefined;
  if (invoice?.text) {
    try {
      const QRCode = await import("qrcode");
      qrDataUrl = await QRCode.toDataURL(invoice.text, { width: 600, margin: 1 });
    } catch {}
  }

  return { id, invoice, subject, user, token, theme, qrDataUrl };
}
