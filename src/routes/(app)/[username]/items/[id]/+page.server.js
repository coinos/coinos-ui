import { get } from "$lib/utils";
export let load = async ({ cookies, params: { id } }) => {
  let item = await get(`/item/${id}`);
  console.log("item", item)
  return { item };
};
