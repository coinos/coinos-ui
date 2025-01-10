import { get } from "$lib/utils";
import updateUser from "$lib/settings";

export const load = async () => {
	const { challenge } = await get("/challenge");
	return { challenge };
};

export const actions = {
	default: updateUser,
};
