import { persistLocal } from "$lib/store";
import { SingleKey, Wallet } from "@arkade-os/sdk";

const prefix = "ark";
export const mnemonic = persistLocal(`${prefix}mnemonic`, "");
export const password = persistLocal(`${prefix}password`, "");
export const arkkey = persistLocal(`${prefix}key`, "");

export const getWallet = async () => {
	// const identity = SingleKey.fromHex(get(arkkey));

	const identity = SingleKey.fromHex(
		"ce66c68f8875c0c98a502c666303dc183a21600130013c06f9d1edf60207abf2",
	);

	return Wallet.create({
		identity,
		arkServerUrl: "https://arkade.computer",
	});
};
