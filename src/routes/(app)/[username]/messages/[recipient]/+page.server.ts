import { get } from "$lib/utils";

export async function load({ params, parent, url }) {
  let { user } = await parent();
  let { since = 0 } = params;

  let messages = [];
  let recipient = await get(`/users/${params.recipient}`);

  try {
    messages = await get(`/${user.pubkey}/${since}/messages`);

    messages = messages
      .filter(
        (m) => m.recipient?.id === recipient.id || m.author?.id === recipient.id
      )
      .sort((a, b) => a.created_at - b.created_at);
  } catch (e) {
    console.log(`failed to fetch nostr messages`, e);
  }

  return { messages, recipient, user };
}
