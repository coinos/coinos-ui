import { get, auth } from '$lib/utils';

let offset = 25;

export async function load({ cookies, params, request }) {
	let parts = params.page.split('/');

	let start, end, page;
	if (parts.length === 1) [page] = parts;
	if (parts.length === 2) [start, page] = parts;
	if (parts.length === 3) [start, end, page] = parts;
	if (!parseInt(page)) page = 1;

	let url = '/payments';
	if (start && end) url += `?start=${start}&end=${end}`;
	else if (start) url += `?start=${start}`;
	else if (end) url += `?end=${end}`;

	let transactions = await get(url, auth(cookies));
	let total = transactions.length;
	let pages = new Array(Math.ceil(total / offset));
	let i = (page - 1) * offset;
	transactions = transactions.slice(i, i + offset);

	return { total, transactions, page, pages, start, end };
}
