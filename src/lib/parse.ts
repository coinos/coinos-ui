import { PUBLIC_DOMAIN } from "$env/static/public";
import { decode } from "$lib/bip21";
import { auth, get, isLiquid, post, sats } from "$lib/utils";
import { redirect } from "@sveltejs/kit";
import { validate } from "bitcoin-address-validation";

export default async (s, host, cookies) => {
	if (!s) return;
	let t = s.trim();
	let amount;
	let invoice;
	let user;

	if (t.startsWith("http")) redirect(307, t);
	if (t.startsWith(host)) redirect(307, `http://${t}`);

	if (t.includes("lightning=")) {
		const url = new URL(t);
		const params = new URLSearchParams(url.search);
		t = params.get("lightning");
	}

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

	if (t.toLowerCase().startsWith("lnr")) {
		const { iid } = await post("/sendinvoice", { invreq: t }, auth(cookies));
		invoice = { id: iid };
	} else if (t.toLowerCase().startsWith("ln")) {
		try {
			invoice = await get(`/invoice/${t}`);
			if (invoice.user.username === "mint") throw new Error("mint payment");
		} catch (e) {
			if (t.toLowerCase().startsWith("lno")) {
				const { offer_amount_msat: a } = await get(`/decode/${t}`);
				if (a) ({ invoice: t } = await post("/fetchinvoice", { offer: t }));
			}
			redirect(307, `/send/lightning/${t}`);
		}
	}

	if (invoice) redirect(307, `/invoice/${invoice.id}`);

	if (t.match(/^🥜([\uFE00-\uFE0F]|[\uE0100-\uE01EF]+)$/)) {
		t = Array.from(t)
			.slice(1)
			.map((char) => {
				const codePoint = char.codePointAt(0);

				// Handle Variation Selectors (VS1-VS16): U+FE00 to U+FE0F
				if (codePoint >= 0xfe00 && codePoint <= 0xfe0f) {
					const byteValue = codePoint - 0xfe00; // Maps FE00->0, FE01->1, ..., FE0F->15
					return String.fromCharCode(byteValue);
				}

				// Handle Variation Selectors Supplement (VS17-VS256): U+E0100 to U+E01EF
				if (codePoint >= 0xe0100 && codePoint <= 0xe01ef) {
					const byteValue = codePoint - 0xe0100 + 16; // Maps E0100->16, E0101->17, ..., E01EF->255
					return String.fromCharCode(byteValue);
				}
			})
			.join("");
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

	try {
		invoice ||= await get(`/invoice/${t}`);
	} catch (e) {}

	if (invoice) redirect(307, `/invoice/${invoice.id}`);
};
