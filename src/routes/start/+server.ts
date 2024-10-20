import { redirect } from "@sveltejs/kit";

export async function GET({ cookies }) {
	const username = cookies.get("username");
	if (username) {
		redirect(307, `/${username}/receive`);
	}

	redirect(307, "/");
}
