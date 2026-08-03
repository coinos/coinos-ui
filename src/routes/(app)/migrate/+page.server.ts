import { redirect } from "@sveltejs/kit";

export async function load({ parent, url }) {
	const { user } = await parent();
	if (!user) redirect(307, `/login?redirect=${encodeURIComponent(url.pathname + url.search)}`);
	return {
		to: url.searchParams.get("to") || "",
		back: url.searchParams.get("back") || "",
	};
}
