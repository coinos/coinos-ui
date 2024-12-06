import getRates from "$lib/rates";
import { redirect } from "@sveltejs/kit";

export const load = async ({ cookies, params: { username }, parent, url }) => {
	const token = cookies.get("token");
	const rates = await getRates();
	if (!token) redirect(307, `/pay/${username}`);
	const { subject } = await parent();
	return {
		rate: rates[subject.currency],
		text: `${username}@${url.host}`,
	};
};
