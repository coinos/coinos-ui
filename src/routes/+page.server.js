import { redirect } from "@sveltejs/kit";

export let load = async ({ parent, url }) => {
  return { faqs: ["cost", "compatibility", "safety", "pos", "bitcoin"] };
};
