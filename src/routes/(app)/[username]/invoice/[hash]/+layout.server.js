import Qr from 'qrcode-base64';
import { get } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export async function load({ depends, params, url }) {
	depends('app:invoice');

	let { hash } = params;
	let invoice = await get(`/invoice/${hash}`);
	let { amount, received } = invoice;
	amount = parseInt(amount);

	let paid = (!amount && received) || (amount > 0 && received >= amount);
	if (paid && !url.pathname.endsWith('paid'))
		throw redirect(307, `/${params.username}/invoice/${hash}/paid`);

	let sm = Qr.drawImg(invoice.text, { size: 300 });

	return { hash, invoice, sm, lg: sm };
}
