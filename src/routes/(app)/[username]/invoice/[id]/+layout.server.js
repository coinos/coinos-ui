import Qr from "qrcode-base64";
import { get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ depends, params, url, parent }) {
  depends("app:invoice");

  let { user } = await parent();
  let { id } = params;
  let invoice = await get(`/invoice/${id}`);
  let options = !!url.searchParams.get("options");

  if (
    user &&
    invoice.uid !== user.id &&
    !url.pathname.includes("tip") &&
    !options
  ) {
    redirect(307, `/send/invoice/${id}`);
  }

  let { amount, pending, received } = invoice;
  amount = parseInt(amount);

  let paid =
    (!amount && (pending || received)) ||
    (amount > 0 && (pending >= amount || received >= amount));
  if (paid && !url.pathname.endsWith("paid")) {
    redirect(
      307,
      `/${params.username}/invoice/${id}/paid` +
        (options ? "?options=true" : "")
    );
  }

  let src = Qr.drawImg(invoice.text || "", { size: 340 });
  return { id, invoice, src };
}
