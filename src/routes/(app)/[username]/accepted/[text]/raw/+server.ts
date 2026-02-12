import Qr from "qrcode-base64";

export async function GET({ params }) {
  const { text } = params;

  const dataUri = Qr.drawImg(text, { size: 600 });
  const base64Data = dataUri.split(",")[1];
  const binaryData = Buffer.from(base64Data, "base64");

  return new Response(binaryData, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
