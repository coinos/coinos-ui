import getRates from "$lib/rates";

export async function load({ depends, parent }) {
	depends("app:payments");
	depends("app:items");

	const { user } = await parent();

	const rates = await getRates();
	return { rate: rates[user.currency] };
}
