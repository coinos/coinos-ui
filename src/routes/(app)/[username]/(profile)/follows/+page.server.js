import { get } from "$lib/utils";

export async function load({ depends, parent }) {
  depends("app:user");
  let { subject } = await parent();
  let follows = get(`/${subject.pubkey}/follows`).catch(() => []);
  return { follows };
}
