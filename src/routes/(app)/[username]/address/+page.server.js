import Qr from 'qrcode-base64';

export async function load({ parent }) {
  let { subject } = await parent();
	let src = Qr.drawImg(subject.username + '@coinos.io', { size: 600 });

	return { src };
}
