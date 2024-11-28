import { auth, get, str } from "$lib/utils";

const limit = 5;

export async function load({ cookies, depends, params }) {
	depends("app:payments");

	const aid = cookies.get("aid");
	const parts = params.page.split("/");

	let start;
	let end;
	let page;
	if (parts.length === 1) [page] = parts;
	if (parts.length === 2) [start, page] = parts;
	if (parts.length === 3) [start, end, page] = parts;
	if (!parseInt(page)) page = 1;

	const offset = (page - 1) * limit;

	const q = new URLSearchParams();
	q.set("limit", str(limit));
	q.set("offset", str(offset));
	if (aid) q.set("aid", aid);
	if (start) q.set("start", str(start * 1000));
	if (end) q.set("end", str(end * 1000));

	const { count, payments, incoming, outgoing } = await get(
		`/payments?${str(q)}`,
		auth(cookies),
	);

	console.log("payments", payments.length);
	const pages = new Array(Math.ceil(count / limit));
	console.log("pages", pages);

	return { payments, page, pages, start, end, incoming, outgoing };
}
