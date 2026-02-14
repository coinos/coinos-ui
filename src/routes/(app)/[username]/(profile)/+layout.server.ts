import getRates from "$lib/rates";

export async function load({ depends, parent }) {
  depends("app:user");

  const rates = await getRates();
  const { subject } = await parent();

  return { rates };
}
