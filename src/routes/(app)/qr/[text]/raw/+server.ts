import QRCode from "qrcode";

export async function GET({ params }) {
  const { text } = params;

  const buffer = await QRCode.toBuffer(text, { width: 600, type: "png", margin: 1 });

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
