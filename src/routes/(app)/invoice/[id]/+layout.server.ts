import { get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, depends, params, url, parent }) {
	depends("app:invoice");

	const token = cookies.get("token");
	let { subject, user } = await parent();
	const { id } = params;
	let invoice;
	// Amount of a payment that arrived while the page was open, set by the
	// socket handler. Only meaningful for reusable (bolt12) offers, whose
	// `received` is a lifetime total rather than this payment.
	let justPaid: string | null = null;

	if (id) {
		invoice = await get(`/invoice/${id}`);
		const options = !!url.searchParams.get("options");
		let { amount, pending, received } = invoice;
		amount = parseInt(amount);

		// A bolt12 offer is a standing, REUSABLE payment code: CLN derives the same
		// offer_id from the same (amount, description), so re-creating one hands back
		// the original record with `received` accumulated over its entire lifetime.
		// Treating that as "paid" bounces the user straight to the success screen so
		// they never get to see the QR or copy the lno — and a long-lived offer that
		// takes regular payouts is effectively unusable, since its last payment may
		// be hours or months old. A standing offer has no terminal paid state, so
		// only a payment arriving live counts — the socket handler signals that
		// with `?paid=<amount>`.
		const reusable = invoice.type === "bolt12";
		justPaid = url.searchParams.get("paid");

		const paid = reusable
			? !!justPaid
			: (!amount && (pending || received)) ||
				(amount > 0 && (pending >= amount || received >= amount));

		if (paid && !url.pathname.endsWith("paid")) {
			const q = new URLSearchParams();
			if (options) q.set("options", "true");
			// Carry the amount of THIS payment through; the success screen would
			// otherwise render lifetime `received` for a reusable offer.
			if (justPaid) q.set("paid", justPaid);
			const qs = q.toString();
			redirect(307, `/invoice/${id}/paid${qs ? `?${qs}` : ""}`);
		}

		subject = invoice.user;

		if (
			user &&
			invoice.uid !== user?.id &&
			!(url.pathname.includes("tip") || url.pathname.includes("memo")) &&
			!options
		) {
			if (invoice.prompt && invoice.tip === null)
				redirect(307, `/invoice/${id}/tip`);
			else {
				redirect(307, `/send/invoice/${id}`);
			}
		}
	}

	const theme = cookies.get("theme") || "light";
	return { id, invoice, subject, user, token, theme, justPaid };
}
