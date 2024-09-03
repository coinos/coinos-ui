import { get } from "$lib/utils";

export async function load({ params }) {
  let { id, version } = params;
  version ||= 4;
  version = parseInt(version);

  let { token, status } = await get(`/cash/${id}/${version}`);
  let { spent, total, mint, external } = status;
  return { id, token, spent, total, mint, external, version };
}
