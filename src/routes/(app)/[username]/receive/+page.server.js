import * as Qr from "qrcode-base64";
export let load = async ({ cookies, url }) => {
  let username = cookies.get("username");
  let text = `${username}@${url.host}`;
  let src = Qr.drawImg(text, { size: 500 });

  return { src, text };
};
