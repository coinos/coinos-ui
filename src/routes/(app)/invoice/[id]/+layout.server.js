import Qr from 'qrcode-svg';
import { get } from '$lib/utils';

export async function load({ params }) {
	let { id } = params;
	let invoice = await get(`/invoice?uuid=${id}`);
	let svg = new Qr({
		content: invoice.text,
		join: true,
		container: 'svg-viewbox'
	}).svg();

	return { id, invoice, svg };
}
