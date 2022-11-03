import Qr from 'qrcode-base64';
import { get } from '$lib/utils';

export async function load({ params }) {
	let { id } = params;
	let invoice = await get(`/invoice?uuid=${id}`);
	let src = Qr.drawImg(invoice.text, { size: 600 });

	return { id, invoice, src };
}
