import { PUBLIC_DOMAIN } from "$env/static/public";
import { decode } from "$lib/bip21";
import { get, isLiquid, post, sats } from "$lib/utils";
import { redirect } from "@sveltejs/kit";
import { validate } from "bitcoin-address-validation";

export default async (s, host) => {
	if (!s) return;
	let t = s.trim();
	let amount;
	let user;

	if (t.startsWith("http")) redirect(307, t);
	if (t.startsWith(host)) redirect(307, `http://${t}`);

	if (t.startsWith("lightning:")) t = t.replace("lightning:", "");
	if (t.endsWith(`@${PUBLIC_DOMAIN}`)) t = t.split("@")[0];
	if (t.includes("@") && t.includes(".")) {
		try {
			t = await get(`/encode?address=${t}`);
		} catch (e) {}
	}

	if (t.toLowerCase().startsWith("nostr:")) {
		t = t.split(":")[1];
	}

	if (["note", "nevent"].some((p) => t.startsWith(p))) redirect(307, `/e/${t}`);
	if (["nprofile", "npub"].some((p) => t.startsWith(p))) redirect(307, `/${t}`);

	// bitcoin
	if (
		t.toLowerCase().startsWith("bitcoin:") ||
		t.toLowerCase().startsWith("liquidnetwork:")
	) {
		({
			address: t,
			options: { amount },
		} = decode(t));
	}

	if (validate(t) || isLiquid(t)) {
		let r = `/send/bitcoin/${t}`;
		if (amount) r += `/${Math.round(amount * sats)}`;
		redirect(307, r);
	}

	// lightning
	if (t.toLowerCase().startsWith("lightning:"))
		t = t.toLowerCase().replace("lightning:", "");
	if (t.toLowerCase().startsWith("lnurl")) redirect(307, `/ln/${t}`);
	if (t.includes(":")) t = t.split(":")[1];

	if (t.includes("lightning=")) {
		const url = new URL(t);
		const params = new URLSearchParams(url.search);
		t = params.get("lightning");
	}

	if (t.toLowerCase().startsWith("ln")) {
		try {
			const inv = await get(`/invoice/${t}`);
			if (inv.user.username === "mint") throw new Error("mint payment");
		} catch (e) {
			if (t.toLowerCase().startsWith("lno")) {
				const { offer_amount_msat: a } = await get(`/decode/${t}`);
				if (a) ({ invoice: t } = await post("/fetchinvoice", { offer: t }));
			}
			redirect(307, `/send/lightning/${t}`);
		}
	}

	if (t.startsWith("cashu")) {
		const { id } = await post("/cash", { token: t });
		redirect(307, `/ecash/${id}`);
	}

	if (t.startsWith("creq")) redirect(307, `/send/ecash/${t}`);

	// user
	try {
		user = await get(`/users/${t.split("/")[0]}`);
		if (user.anon) user = null;
	} catch (e) {}

	if (user) redirect(307, `/pay/${t}`);

	let fund;
	if (t.includes("/fund")) redirect(307, t.substring(t.indexOf("/fund")));

	try {
		fund = await get(`/fund/${t}`);
	} catch (e) {}

	if (fund) redirect(307, `/send/fund/${t}`);

	// invoice
	let invoice;
	try {
		invoice = await get(`/invoice/${t}`);
	} catch (e) {}

	if (invoice) redirect(307, `/send/invoice/${invoice.id}`);
};
