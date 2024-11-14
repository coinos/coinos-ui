import { auth, get, post } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export default async ({ cookies, request }) => {
	console.log("LOADING");
	const form = await request.formData();
	const aid = form.get("aid") || cookies.get("aid");

	const rates = await get("/rates");
	const amount = parseInt(form.get("amount"));

	let invoice = {
		aid,
		amount,
		items: JSON.parse(form.get("items")),
		memo: form.get("memo"),
		memoPrompt: form.get("memoPrompt"),
		tip: parseInt(form.get("tip")) || 0,
		type: form.get("type"),
		prompt: form.get("prompt") === "true",
		rate: parseFloat(form.get("rate")) || rates[form.get("currency")],
		id: undefined,
	};

	const user = {
		username: form.get("username"),
		currency: form.get("currency"),
	};

	invoice = await post("/invoice", { invoice, user }, auth(cookies));
	const { id } = invoice;

	if (invoice.prompt && invoice.tip === null)
		redirect(307, `/invoice/${id}/tip`);

	if (invoice.memoPrompt && !invoice.memo) {
		redirect(307, `/invoice/${id}/memo`);
	} else redirect(307, `/invoice/${id}`);
};
