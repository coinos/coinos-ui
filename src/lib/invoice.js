import { auth, get, post } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export default async ({ cookies, request, url }) => {
  let form = await request.formData();

  let rates = await get("/rates");
  let amount = parseInt(form.get("amount"));

  let invoice = {
    amount,
    items: JSON.parse(form.get("items")),
    memo: form.get("memo"),
    memoPrompt: form.get("memoPrompt"),
    tip: parseInt(form.get("tip")) || 0,
    type: form.get("type"),
    prompt: form.get("prompt") === "true",
    rate: parseFloat(form.get("rate")) || rates[form.get("currency")],
  };

  let user = { username: form.get("username"), currency: form.get("currency") };

  invoice = await post("/invoice", { invoice, user }, auth(cookies));
  let { id } = invoice;

  if (invoice.prompt && invoice.tip === null)
    redirect(307, `/${user.username}/invoice/${id}/tip`);

  if (invoice.memoPrompt && !invoice.memo) {
    redirect(307, `/${user.username}/invoice/${id}/memo`);
  } else redirect(307, `/${user.username}/invoice/${id}`);
};
