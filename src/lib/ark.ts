import { persistLocal } from "$lib/store";
import { get } from "svelte/store";
import { SingleKey, Wallet } from "@arkade-os/sdk";
import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import { nip19 } from "nostr-tools";
import { hex } from "@scure/base";

export const arkServerUrl = "http://localhost:7070";
export const arkkey = persistLocal("arkkey", "");

export const generateKey = (): string => {
	const privateKey = bytesToHex(randomBytes(32));
	arkkey.set(privateKey);
	return privateKey;
};

export const getKey = (): string => {
	let key = get(arkkey);
	if (!key) {
		key = generateKey();
	}
	return key;
};

export const hasKey = (): boolean => {
	return !!get(arkkey);
};

export const clearKey = (): void => {
	arkkey.set("");
};

export const keyToNsec = (key?: string): string => {
	const k = key || getKey();
	return nip19.nsecEncode(hex.decode(k));
};

export const nsecToKey = (nsec: string): string => {
	const { type, data } = nip19.decode(nsec);
	if (type !== "nsec") throw new Error("Invalid nsec format");
	return bytesToHex(data);
};

export const restoreFromNsec = (nsec: string): string => {
	const key = nsecToKey(nsec);
	arkkey.set(key);
	return key;
};

export const getWallet = async () => {
	const key = getKey();
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

export const getBalance = async (): Promise<{ available: number; pending: number }> => {
	const wallet = await getWallet();
	return wallet.getBalance();
};

export const syncArkAddress = async (
	currentAddress: string | undefined,
	updateFn: (arkAddress: string) => Promise<void>
): Promise<string> => {
	const address = await getAddress();
	if (address !== currentAddress) {
		await updateFn(address);
	}
	return address;
};

export const sendArk = async (address: string, amount: number): Promise<string> => {
	const wallet = await getWallet();
	const vtxos = await wallet.getVtxos();

	// Sort by expiry (spend oldest first)
	const sorted = vtxos.sort(
		(a, b) => (a.virtualStatus.batchExpiry ?? 0) - (b.virtualStatus.batchExpiry ?? 0)
	);

	// Select inputs
	const inputs = [];
	let selectedAmount = 0;
	for (const vtxo of sorted) {
		if (selectedAmount >= amount) break;
		inputs.push(vtxo);
		selectedAmount += vtxo.value;
	}

	if (selectedAmount < amount) {
		throw new Error(`Insufficient funds: have ${selectedAmount}, need ${amount}`);
	}

	// Build outputs
	const outputs: { address: string; amount: bigint }[] = [
		{ address, amount: BigInt(amount) }
	];

	// Add change output if needed
	const change = selectedAmount - amount;
	if (change > 0) {
		const changeAddress = await wallet.getAddress();
		outputs.push({ address: changeAddress, amount: BigInt(change) });
	}

	return wallet.settle({ inputs, outputs });
};
