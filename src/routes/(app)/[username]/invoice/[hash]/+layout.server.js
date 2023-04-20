import Qr from 'qrcode-base64';
import { get } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export async function load({ depends, params, url, parent }) {
	depends('app:invoice');

	let { user } = await parent();
	let { hash } = params;
	let invoice = await get(`/invoice/${hash}`);

	if (user && invoice.uid !== user.id && !url.pathname.includes('tip'))
		throw redirect(307, `/send/invoice/${hash}`);

	let { amount, pending, received } = invoice;
	amount = parseInt(amount);

	let paid = (!amount && received) || (amount > 0 && (pending >= amount || received >= amount));
	if (paid && !url.pathname.endsWith('paid'))
		throw redirect(307, `/${params.username}/invoice/${hash}/paid`);

	let sm = Qr.drawImg(invoice.text || '', { size: 300 });

	return { hash, invoice, sm, lg: sm };
}
