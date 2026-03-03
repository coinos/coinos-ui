import { signer } from "$lib/store";
import { getCookie } from "$lib/utils";
import { get } from "svelte/store";

export const ssr = false;
export async function load() {
  const sk = getCookie("sk");
  if (sk && !get(signer)) signer.set({ method: "nsec", params: { sk }, ready: true });
}
