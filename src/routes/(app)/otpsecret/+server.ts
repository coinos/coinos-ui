import { auth, post } from "$lib/utils";
import { error } from "@sveltejs/kit";

export async function POST({ cookies, request }) {
  try {
    const body = await request.json();
    const { username, secret } = await post("/otpsecret", body, auth(cookies));
    const uri = `otpauth://totp/coinos:${username}?secret=${secret}&period=30&digits=6&algorithm=SHA1&issuer=coinos`;
    return new Response(JSON.stringify({ secret, uri }));
  } catch (e: any) {
    if (e.message.includes("pin")) throw e;
    error(500, "Problem saving secret");
  }
}
