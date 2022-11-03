import { auth, post } from "$lib/utils";
export const actions = {
	default: async ({ cookies, request }) => {
		let form = Object.fromEntries(await request.formData());
    return { request: await post('/requests', form, auth(cookies)) };
	}
};
