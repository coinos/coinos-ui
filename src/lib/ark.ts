import { persistLocal } from "$lib/store";
import { post } from "$lib/utils";
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

export const syncTransactions = async (aid: string) => {
	const wallet = await getWallet();
	if (!wallet) return;

	const history = await wallet.getTransactionHistory();
	if (!history.length) return;

	const transactions = history.map((tx) => ({
		hash: tx.key.arkTxid || tx.key.commitmentTxid,
		amount: tx.type === "RECEIVED" ? tx.amount : -tx.amount,
		settled: tx.settled,
		createdAt: tx.createdAt,
	}));

	return post("/ark/sync", { transactions, aid });
};

export const settle = async () => {
	const wallet = await getWallet();
	if (!wallet) return;

	const balance = await wallet.getBalance();
	if (!balance.preconfirmed) return;

	return wallet.settle();
};
