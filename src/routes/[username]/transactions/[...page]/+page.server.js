import { get, auth } from '$lib/utils';

let offset = 25;

export async function load({ params, request }) {
	let page = parseInt(params.page || 1);
	let transactions = await get('/payments', auth(request));
	let total = transactions.length;
	let pages = new Array(Math.ceil(total / offset));
	let i = (page - 1) * offset;
	transactions = transactions.slice(i, i + offset);

	return { total, transactions, page, pages };
}
