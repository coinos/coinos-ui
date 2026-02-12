import { json } from "@sveltejs/kit";

export async function GET({ params }) {
  console.log(params);
  return json({});
}
