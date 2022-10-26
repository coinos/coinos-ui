import { get, auth } from '$lib/utils';

let limit = 25;

export async function load({ cookies, params, request }) {
	let parts = params.page.split('/');

	let start, end, page;
	if (parts.length === 1) [page] = parts;
	if (parts.length === 2) [start, page] = parts;
	if (parts.length === 3) [start, end, page] = parts;
	if (!parseInt(page)) page = 1;

	let offset = (page-1) * limit;

	let url = `/payments?v2=true&limit=${limit}&offset=${offset}`;
	if (start) url += `&start=${start}`;
	if (end) url += `&end=${end}`;

	let { total, transactions } = await get(url, auth(cookies));
  console.log("TOT", total, transactions.length);
	let pages = new Array(Math.ceil(total / limit));


	return { total, transactions, page, pages, start, end };
}
