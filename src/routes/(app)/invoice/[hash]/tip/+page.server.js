import invoice from '$lib/invoice';
import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
	let { invoice } = await parent();
	if (!invoice.amount) throw redirect(307, `/invoice/${invoice.id}`);
}

export const actions = {
	default: invoice
};
