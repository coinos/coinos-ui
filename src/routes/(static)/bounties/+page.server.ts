import { get } from "$lib/utils";
export const load = async () => {
	const users = [
		{
			username: "fustler",
			merchant: "rrdrive",
			type: "Bakery",
			amount: 1000000,
		},
		{
			username: "laluna",
			merchant: "butchersguild",
			type: "Butcher Shop",
			amount: 1000000,
		},
		{
			username: "ica547",
			merchant: "vanlove",
			type: "Sushi Restaurant",
			amount: 1000000,
		},
		{
			username: "reverendhodl",
			merchant: "laughingbean",
			type: "Cafe",
			amount: 1000000,
		},
		{
			username: "kimsrepair",
			merchant: "kimsrepair",
			type: "Kims Repair",
			amount: 100000,
		},
	];

	for (const user of users) {
		const { username, merchant } = user;
		console.log(username, merchant);
		user.user = await get(`/users/${username}`);
		user.merchant = await get(`/users/${merchant}`);
	}

	return { users };
};
