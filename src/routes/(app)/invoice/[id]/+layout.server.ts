import { get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, depends, params, url, parent }) {
	depends("app:invoice");

	const token = cookies.get("token");
	let { subject, user } = await parent();
	const { id } = params;
	let invoice;

	if (id) {
		invoice = await get(`/invoice/${id}`);
		const options = !!url.searchParams.get("options");

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
		subject = invoice.user;

		const paid =
			(!amount && (pending || received)) ||
			(amount > 0 && (pending >= amount || received >= amount));
		if (paid && !url.pathname.endsWith("paid")) {
			redirect(307, `/invoice/${id}/paid` + (options ? "?options=true" : ""));
		}
	}

	const theme = cookies.get("theme") || "light";
	return { id, invoice, subject, user, token, theme };
}
