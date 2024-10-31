import invoice from "$lib/invoice";
import { redirect } from "@sveltejs/kit";

export async function load({ parent, params }) {
	const { invoice } = await parent();
	if (!invoice.amount) {
		redirect(307, `/invoice/${invoice.id}`);
	}
}

export const actions = {
	default: invoice,
};
