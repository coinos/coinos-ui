import { redirect } from "@sveltejs/kit";

export const load = async ({ cookies, params: { username }, url }) => {
	const token = cookies.get("token");
	if (!token) redirect(307, `/pay/${username}`);
	return { text: `${username}@${url.host}` };
};
