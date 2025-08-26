import { get } from "$lib/utils";

export async function load({ params }) {
    const recipient = await get(`/users/${params.recipient}`);
    return { recipient };
}
