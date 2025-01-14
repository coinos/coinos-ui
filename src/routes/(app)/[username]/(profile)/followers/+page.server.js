import { get } from "$lib/utils";

export async function load({ depends, parent }) {
	depends("app:user");
	const { subject } = await parent();
	console.log("GETTING FOLLOWERS", subject.username);
	const followers = await get(`/${subject.pubkey}/followers`);
	console.log("FOLLOWERS", followers.length);
	return { followers };
}
