import { get } from "$lib/utils";

let last;
let rates;

export default async function getRates() {
  if (!rates || Date.now() - last > 60000) {
    rates = await get("/rates");
    last = Date.now();
  }

  return rates;
}
