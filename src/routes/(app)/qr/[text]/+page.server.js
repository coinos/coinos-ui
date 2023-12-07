import Qr from "qrcode-base64";

export async function load({ params }) {
  let { text } = params;
  let src = Qr.drawImg(text, { size: 600 });

  return { src, text };
}
