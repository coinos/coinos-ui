import Qr from 'qrcode-base64';
import { get } from '$lib/utils';

export async function load({ params }) {
	let { id } = params;
	let invoice = await get(`/invoice?uuid=${id}`);
	let sm = Qr.drawImg(invoice.text, { size: 300 });
	let lg = Qr.drawImg(invoice.text, { size: 1200 });

	return { id, invoice, sm, lg };
}
