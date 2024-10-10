import { get } from "$lib/utils";

export async function load({ depends, parent }) {
  depends("app:user");

  let { subject, user } = await parent();

  let count = get(`/${subject.pubkey}/count`).catch(() => 0);
  let follows = get(`/${subject.pubkey}/follows`).catch(() => []);
  let followers = get(`/${subject.pubkey}/followers`).catch(() => []);
  let followList = get(`/${user.pubkey}/follows?tagsonly=true`).catch(() => []);

  return { count, follows, followers, followList };
}
