import getRates from "$lib/rates";
import updateUser from "$lib/settings";
import { auth, get } from "$lib/utils";

export async function load({ cookies }) {
	const rates = await getRates();
	const connect = await get("/square/connect", auth(cookies));
	return { connect, rates };
}

export const actions = {
	default: updateUser,
};
