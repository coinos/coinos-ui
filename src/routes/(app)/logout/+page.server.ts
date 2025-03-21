import { redirect } from "@sveltejs/kit";

const opts = {
	expires: new Date(0),
	path: "/",
};

export async function load({ cookies }) {
	const lang = cookies.get("lang");
	cookies.set("aid", "", opts);
	cookies.set("lang", "", opts);
	cookies.set("username", "", opts);
	cookies.set("token", "", opts);
	cookies.set("pin", "", opts);
	cookies.set("sk", "", opts);
	cookies.set("theme", "", opts);
	cookies.set("sid", "", opts);
	redirect(307, `/login?lang=${lang}`);
}
