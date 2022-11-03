export const actions = {
	default: async ({ cookies, request }) => {
		let form = Object.fromEntries(await request.formData());

		try {
			await post('/email', form);
		} catch (e) {
			return invalid(400, { failed: true });
		}

		return { success: true };
	}
};
