import { get } from '$lib/utils';
import { error } from '@sveltejs/kit';

export async function load({ params: { id } }) {
	try {
		let event = await get(`/event/${id}`);
		if (!event) throw error(500, 'Event not found');
		return { event };
	} catch (e) {
		throw error(500, e.message);
	}
}
