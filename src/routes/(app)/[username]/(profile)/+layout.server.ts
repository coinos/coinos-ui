import getRates from "$lib/rates";
import { get } from "$lib/utils";

export async function load({ depends, parent }) {
	depends("app:user");

	const rates = await getRates();
	const { subject, user } = await parent();

	const { follows, followers } = await get(`/${subject.pubkey}/count`);
	let followList = new Promise((r) => r([]));
	if (user)
		followList = get(`/${user.pubkey}/follows?pubkeysOnly=true`).catch(
			() => [],
		);

	return { follows, followers, followList, rate: rates[subject.currency] };
}
