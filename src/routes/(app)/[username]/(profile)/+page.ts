import { signer } from "$lib/store";
import cookies from "js-cookie";
import { get } from "svelte/store";

export const ssr = false;
export async function load() {
  const sk = cookies.get("sk");
  if (sk && !get(signer))
    signer.set({ method: "nsec", params: { sk }, ready: true });
}
