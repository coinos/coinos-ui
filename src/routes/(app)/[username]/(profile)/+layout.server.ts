import getRates from "$lib/rates";

export async function load({ depends }) {
  depends("app:user");

  const rates = await getRates();

  return { rates };
}
