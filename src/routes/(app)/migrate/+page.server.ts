import { auth, post } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

const REGISTRAR = "https://names.coinos.io";

// An invoice from the v3 registrar for this address and amount (LNURL-pay).
async function invoiceFor(address: string, sats: number) {
	const [name, domain] = String(address).split("@");
	if (!name || !domain) throw new Error("bad destination address");
	const p = await fetch(
		`${REGISTRAR}/.well-known/lnurlp/${name}?domain=${encodeURIComponent(domain)}`,
	).then((r) => r.json());
	if (!p?.callback) throw new Error(p?.reason || "that address isn't registered on coinos v3 yet");
	const msat = sats * 1000;
	if (msat < p.minSendable) throw new Error("balance is below the destination's minimum");
	if (msat > p.maxSendable) throw new Error("balance is above the destination's maximum");
	const sep = p.callback.includes("?") ? "&" : "?";
	const inv = await fetch(`${p.callback}${sep}amount=${msat}`).then((r) => r.json());
	if (!inv?.pr) throw new Error(inv?.reason || "could not get an invoice");
	return inv.pr as string;
}

export async function load({ parent, url }) {
	const { user } = await parent();
	if (!user) redirect(307, `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);
	return {
		to: url.searchParams.get("to") || "",
		back: url.searchParams.get("back") || "",
	};
}

export const actions = {
	default: async ({ cookies, request, url }) => {
		const form = await request.formData();
		const to = String(form.get("to") || url.searchParams.get("to") || "");
		const pin = String(form.get("pin") || "");
		const balance = Number(form.get("balance") || 0);
		const username = String(form.get("username") || "");
		if (!to) return { error: "no destination" };

		let sent = 0;
		try {
			if (balance > 0) {
				// coinos and the ASP peer directly, so a sweep normally costs
				// nothing. Try the whole balance first and only hold a little
				// back if the payment actually comes up short.
				const attempts = [balance, balance - Math.max(1, Math.ceil(balance * 0.005))];
				let lastErr;
				for (const amount of attempts) {
					if (amount <= 0) continue;
					try {
						const payreq = await invoiceFor(to, amount);
						await post("/payments", { payreq, ...(pin ? { pin } : {}) }, auth(cookies));
						sent = amount;
						break;
					} catch (e) {
						lastErr = e;
						const msg = String((e as any)?.message || e);
						// only a shortfall is worth retrying smaller
						if (!/insufficient|balance|not enough|fee/i.test(msg)) throw e;
					}
				}
				if (!sent) throw lastErr;
			}
			// Hand the name over for receiving. The account itself stays exactly
			// as it is — same username, same history, still usable here; the
			// registrar just becomes the answer for incoming payments.
			await post("/user", { migrated: true, ...(pin ? { pin } : {}) }, auth(cookies));
			return { ok: true, sent, released: username };
		} catch (e) {
			const msg = e && typeof e === "object" && "message" in e ? String(e.message) : String(e);
			return { error: msg, sent };
		}
	},
};
