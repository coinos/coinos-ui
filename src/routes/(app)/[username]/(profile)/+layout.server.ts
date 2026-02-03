import getRates from "$lib/rates";

export async function load({ depends, parent }) {
	depends("app:user");

	const rates = await getRates();
	const { subject, user } = await parent();

	return { rate: rates[subject.currency] };
}
