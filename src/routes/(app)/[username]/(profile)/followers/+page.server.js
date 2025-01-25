import { get } from "$lib/utils";

export async function load({ depends, parent }) {
	depends("app:user");
	const { subject } = await parent();
	const followers = await get(`/${subject.pubkey}/followers`);
	return { followers };
}
