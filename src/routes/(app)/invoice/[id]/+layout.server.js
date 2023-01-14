import Qr from 'qrcode-base64';
import { get } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export async function load({ depends, params, url }) {
	depends('app:invoice');

	let { id } = params;
	let invoice = await get(`/invoice?id=${id}`);
	let { amount, received } = invoice;
	amount = parseInt(amount);

	let paid = (!amount && received) || (amount > 0 && received >= amount);
	if (paid && !url.pathname.endsWith('paid')) throw redirect(307, `/invoice/${id}/paid`);

	let sm = Qr.drawImg(invoice.text, { size: 300 });

	return { id, invoice, sm, lg: sm };
}
