import { createCanvas, loadImage } from "canvas";
import QRCode from "qrcode";

export async function GET({ params }) {
  const { icon, text } = params;
  const size = 600;

  const canvas = createCanvas(size, size);
  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel: "H",
    width: size,
  });

  const ctx = canvas.getContext("2d");

  const logo = await loadImage(`static/images/${icon}`);
  const logoSize = size * 0.3;
  ctx.drawImage(
    logo,
    (size - logoSize) / 2,
    (size - logoSize) / 2,
    logoSize,
    logoSize,
  );

  const buffer = canvas.toBuffer("image/png");
  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
