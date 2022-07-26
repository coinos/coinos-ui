import { rate } from "$lib/store";
export const messages = (data) => ({
	rate() {
		rate.set(data);
	},

	payment() {
		console.log(data);
	}
});
