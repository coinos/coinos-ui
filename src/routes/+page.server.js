// export const prerender = true;
import { redirect } from "@sveltejs/kit";

export let load = async ({ cookies }) => {
	let colorThemeSelected = "dark";
	if (cookies.get("colortheme")) {
		colorThemeSelected = cookies.get("colortheme");
	}

  return { faqs: ["cost", "compatibility", "safety", "pos", "bitcoin"], colorThemeSelected: colorThemeSelected };
};

export const actions = {
	setTheme: async ({ url, cookies }) => {
		const theme = url.searchParams.get("theme");
		const redirectTo = url.searchParams.get("redirectTo");

		if (theme) {
			cookies.set("colortheme", theme, {
				path: "/",
				maxAge: 60 * 60 * 24 * 365,
			});
		}

		throw redirect(303, redirectTo ?? "/");
	},
};