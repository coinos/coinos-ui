import { get, auth } from '$lib/utils';

let limit = 25;

export async function load({ cookies, params, request }) {
	let parts = params.page.split('/');

	let start, end, page;
	if (parts.length === 1) [page] = parts;
	if (parts.length === 2) [start, page] = parts;
	if (parts.length === 3) [start, end, page] = parts;
	if (!parseInt(page)) page = 1;

	let offset = (page - 1) * limit;
  if (!start) start = Date.now() - 24 * 60 * 60 * 1000;

	let url = `/payments?v2=true&start=${start}&limit=${limit}&offset=${offset}`;
	if (end) url += `&end=${end}`;

	let { total, transactions } = await get(url, auth(cookies));
	let pages = new Array(Math.ceil(total / limit));

	return { total, transactions, page, pages, start, end };
}
