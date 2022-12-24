import { json } from "@sveltejs/kit";
import { post } from "$lib/utils";

export async function POST({ request }) {
   return json(await post('/checkPassword', await request.json()));
} 
