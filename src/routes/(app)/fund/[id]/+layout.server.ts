import getRates from "$lib/rates";
import { get } from "$lib/utils";

export const load = async ({ depends, params: { id }, parent }) => {
	depends("app:payments");
	const data = await get(`/fund/${id}`);
	data.managers = await get(`/fund/${id}/managers`);
	const rates = await getRates();
	const { user } = await parent();
	data.rate = rates[user?.currency || "USD"];
	return data;
};
