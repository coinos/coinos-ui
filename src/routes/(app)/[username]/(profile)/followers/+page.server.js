import { get } from "$lib/utils";

export async function load({ depends, parent }) {
  depends("app:user");
  let { subject } = await parent();
  let followers = get(`/${subject.pubkey}/followers`).catch(() => []);
  return { followers };
}
