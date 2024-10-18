import { get } from "$lib/utils";

export async function load({ depends, parent }) {
  depends("app:user");

  let { subject, user } = await parent();

  let { follows, followers } = await get(`/${subject.pubkey}/count`);
  let followList = new Promise((r) => r([]));
  if (user)
    followList = get(`/${user.pubkey}/follows?pubkeysOnly=true`).catch(
      () => [],
    );

  return { follows, followers, followList };
}
