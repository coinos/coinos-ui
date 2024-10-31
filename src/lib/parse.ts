import { PUBLIC_DOMAIN } from "$env/static/public";
import { get, isLiquid, post } from "$lib/utils";
import { redirect } from "@sveltejs/kit";
import bip21 from "bip21";
import { validate } from "bitcoin-address-validation";

export default async (t, host) => {
	if (!t) return;

	if (t.startsWith("http")) redirect(307, t);
	if (t.startsWith(host)) redirect(307, `http://${t}`);

	let amount;
	let user;

	t = t.trim();
	t.toLowerCase().startsWith("bitcoin:") &&
		({
			address: t,
			options: { amount },
		} = bip21.decode(t));

	if (t.startsWith("lightning:")) t = t.replace("lightning:", "");
	if (t.endsWith(`@${PUBLIC_DOMAIN}`)) t = t.split("@")[0];
	if (t.includes("@") && t.includes(".")) {
		try {
			t = await get(`/encode?address=${t}`);
		} catch (e) {}
	}

	if (t.includes("/fund")) redirect(307, t.substring(t.indexOf("/fund")));

	// invoice
	let invoice;
	try {
		invoice = await get(`/invoice/${t}`);
	} catch (e) {}

	if (invoice) redirect(307, `/send/invoice/${invoice.id}`);

	// lightning
	if (t.toLowerCase().startsWith("lightning:"))
		t = t.toLowerCase().replace("lightning:", "");
	if (t.toLowerCase().startsWith("lnurl")) redirect(307, `/ln/${t}`);
	if (t.includes(":")) t = t.split(":")[1];

	if (t.toLowerCase().startsWith("ln")) {
		try {
			await get(`/invoice/${t}`);
		} catch (e) {
			redirect(307, `/send/lightning/${t}`);
		}
	}

	// bitcoin
	if (validate(t) || isLiquid(t)) {
		let r = `/send/bitcoin/${t}`;
		if (amount) r += `/${amount}`;
		redirect(307, r);
	}

	if (t.startsWith("cashu")) {
		const { id } = await post("/cash", { token: t });
		redirect(307, `/ecash/${id}`);
	}

	// user
	try {
		user = await get(`/users/${t.split("/")[0]}`);
		if (user.anon) user = null;
	} catch (e) {}

	if (user) redirect(307, `/pay/${t}`);

	let fund;
	try {
		fund = await get(`/fund/${t}`);
	} catch (e) {}

	if (fund) redirect(307, `/send/fund/${t}`);
};
