export const load = ({ parent }) => parent();

export const actions = {
	default: async ({ cookies, request }) => {
		let form = Object.fromEntries(await request.formData());
		console.log(form);
	}
};
