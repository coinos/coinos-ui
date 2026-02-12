import { get } from "$lib/utils";
import type { Message } from "$lib/types";

export async function load({ params, parent }) {
  const { user } = await parent();
  const { since = 0 } = params;

  let messages: Message[] = [];
  const recipient = await get(`/users/${params.recipient}`);

  try {
    messages = await get(`/${user.pubkey}/${since}/messages`);

    messages = messages
      .filter(
        (m: Message) =>
          m.recipient?.id === recipient.id || m.author?.id === recipient.id,
      )
      .sort((a, b) => a.created_at - b.created_at);
  } catch (e) {
    console.log("failed to fetch nostr messages", e);
  }

  return { messages, recipient, user };
}
