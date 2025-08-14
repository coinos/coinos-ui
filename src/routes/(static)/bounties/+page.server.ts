import { get } from "$lib/utils";
export const load = async () => {
	const users = [
		{ username: "fustler", merchant: "rrdrive", type: "Bakery" },
		{ username: "laluna", merchant: "butchersguild", type: "Butcher" },
		{ username: "ica547", merchant: "vanlove", type: "Sushi Restaurant" },
		{ username: "reverendhodl", merchant: "laughingbean", type: "Cafe" },
	];

	for (const user of users) {
		const { username, merchant } = user;
		console.log(username, merchant);
		user.user = await get(`/users/${username}`);
		user.merchant = await get(`/users/${merchant}`);
	}

	return { users };
};
