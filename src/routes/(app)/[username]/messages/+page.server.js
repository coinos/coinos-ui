import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent, url }) {
  let { user } = await parent();
  if (user.username !== params.username) redirect(307, `/${params.username}`);
  let { since = 0 } = params;

  let messages = [],
    notes = [];

  if (user?.pubkey) {
    let { pubkey } = user;
    try {
      messages = await get(`/${pubkey}/${since}/messages`);
      messages = messages.sort((a, b) => b.created_at - a.created_at);
    } catch (e) {
      console.log(`failed to fetch nostr messages`, e);
    }

    try {
      notes = await get(`/${pubkey}/notes`);
    } catch (e) {
      console.log(`failed to fetch nostr notes for ${pubkey}`, e);
    }

    notes.map((e) => {
      e.seen = e.created_at;
    });
  }

  return { messages, notes };
}
