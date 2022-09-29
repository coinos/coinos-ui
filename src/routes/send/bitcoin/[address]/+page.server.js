import { redirect } from "@sveltejs/kit";
export const actions = {
	default: async ({ request }) => {
		let form = Object.fromEntries(await request.formData());
		console.log('send bitcoin', form);
		throw redirect(307, '/');
	}
};
