import getRates from "$lib/rates";
import { get, post } from "$lib/utils";

export async function load({ params, parent }) {
	const { user } = await parent();
	const rates = await getRates();
	let { id, version } = params;
	version ||= 4;
	version = parseInt(version);

	// A pasted token arrives in the URL itself and is checked statelessly;
	// anything else is an id from the share links the server used to hand out.
	let token: string;
	let status: any;
	if (id.startsWith("cashu")) {
		token = id;
		status = await post("/ecash/status", { token });
	} else {
		({ token, status } = await get(`/cash/${id}/${version}`));
	}
	const { spent, total, mint, external } = status;
	return {
		id,
		token,
		spent,
		total,
		mint,
		external,
		version,
		rate: rates[user?.currency || "USD"],
	};
}
