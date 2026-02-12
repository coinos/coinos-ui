import getRates from "$lib/rates";
import { get } from "$lib/utils";

export async function load({ params, parent }) {
  const { user } = await parent();
  const rates = await getRates();
  let { id, version } = params;
  version ||= 4;
  version = parseInt(version);

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
