import { auth, get } from "$lib/utils";
import { json } from "@sveltejs/kit";

export async function GET({ cookies }) {
  try {
    const contacts = await get("/contacts", auth(cookies));
    return json(contacts);
  } catch (e) {
    console.log(e);
    return json({});
  }
}
