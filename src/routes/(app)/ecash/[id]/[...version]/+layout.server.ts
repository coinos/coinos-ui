import getRates from "$lib/rates";
import { get } from "$lib/utils";

export async function load({ params, parent }) {
  const { user } = await parent();
  const rates = await getRates();
  const { id } = params;
  let version: string | number = params.version || "4";
  version = parseInt(String(version));

  const { token, status } = await get(`/cash/${id}/${version}`);
  const { spent, total, mint, external } = status;
  return {
    id,
    token,
    spent,
    total,
    mint,
    external,
    version,
    rate: rates[user?.currency || "USD"],
  };
}
