export let load = async ({ cookies }) => {
	let token = cookies.get('token');
	return { token };
};
