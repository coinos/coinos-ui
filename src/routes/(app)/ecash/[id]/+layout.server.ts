import { get } from "$lib/utils";

export async function load({ params }) {
  let { id } = params;
  let { token, status } = await get(`/cash/${id}`);
  let { spent, total, mint, external } = status;
  return { id, token, spent, total, mint, external };
}
