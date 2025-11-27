import { persistLocal } from "$lib/store";
import { SingleKey, Wallet } from "@arkade-os/sdk";
import { get } from "svelte/store";

export const arkServerUrl = "http://localhost:7070";
export const arkkey = persistLocal("arkkey", "");

export const getWallet = async () => {
	const key = get(arkkey);
	if (!key) return;
	const identity = SingleKey.fromHex(key);

	return Wallet.create({
		identity,
		arkServerUrl,
	});
};

export const getAddress = async (): Promise<string> => {
	const wallet = await getWallet();
	return wallet.getAddress();
};

export const getBalance = async (): Promise<{ available: number }> => {
	const wallet = await getWallet();
	return wallet.getBalance();
};
