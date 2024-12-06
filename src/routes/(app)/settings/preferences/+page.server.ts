import getRates from "$lib/rates";
import updateUser from "$lib/settings";

export async function load() {
	const rates = await getRates();
	return { rates };
}

export const actions = {
	default: updateUser,
};
