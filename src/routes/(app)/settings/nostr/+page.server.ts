import updateUser from "$lib/settings";
import { auth, get } from "$lib/utils";

export const load = async ({ cookies }) => {
	const { challenge } = await get("/challenge");
	const apps = await get("/apps", auth(cookies));

	let offer;
	try {
		({ hash: offer } = await get("/offer", auth(cookies)));
	} catch (e) {}

	return { apps, challenge, offer };
};

export const actions = {
	default: updateUser,
};
