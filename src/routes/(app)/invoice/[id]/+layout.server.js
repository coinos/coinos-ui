import Qr from 'qrcode-base64';
import { get } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export async function load({ depends, params, url }) {
	depends('app:invoice');

	let { id } = params;
	let invoice = await get(`/invoice?id=${id}`);
	let { amount, received, pending } = invoice;
	amount = parseInt(amount);

	let paid = (!amount && (received || pending)) || (amount > 0 && received + pending >= amount);
	if (paid && !url.pathname.endsWith('paid')) throw redirect(307, `/invoice/${id}/paid`);

	let sm = Qr.drawImg(invoice.text, { size: 300 });
	// let lg = Qr.drawImg(invoice.text, { size: 1200 });

	return { id, invoice, sm, lg: sm };
}
