import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies }) {
	const token = cookies.get("token");
	if (!token) redirect(307, "/login");
	const user = await get("/me", auth(cookies));
	if (!user) redirect(307, "/login");

	return { user };
}
