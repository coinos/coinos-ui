import { get } from "$lib/utils";

export async function load({ depends, parent }) {
	depends("app:user");
	const { subject } = await parent();
	const follows = get(`/${subject.pubkey}/follows`).catch(() => []);
	return { follows };
}
