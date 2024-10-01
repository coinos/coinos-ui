import * as Qr from "qrcode-base64";
import { get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, depends, params, url, parent }) {
  depends("app:invoice");

  let token = cookies.get("token");
  let { subject, user } = await parent();
  let { id } = params;
  let invoice;

  if (id) {
    invoice = await get(`/invoice/${id}`);
    let options = !!url.searchParams.get("options");

    if (
      user &&
      invoice.uid !== user.id &&
      !(url.pathname.includes("tip") || url.pathname.includes("memo")) &&
      !options
    ) {
      redirect(307, `/send/invoice/${id}`);
    }

    let { amount, pending, received } = invoice;
    amount = parseInt(amount);
    subject = user || invoice.user;

    let paid =
      (!amount && (pending || received)) ||
      (amount > 0 && (pending >= amount || received >= amount));
    if (paid && !url.pathname.endsWith("paid")) {
      redirect(307, `/invoice/${id}/paid` + (options ? "?options=true" : ""));
    }
  }

  let src = Qr.drawImg(invoice?.text || "", { size: 500 });
  return { id, invoice, subject, src, user, token };
}
