import { get } from "$lib/utils";

export async function load({ depends, parent }) {
	depends("app:user");
	const { subject } = await parent();
	const follows = await get(`/${subject.pubkey}/follows`);

	return { follows };
}
