import { PUBLIC_COINOS_NETWORK } from "$env/static/public";
import { persistLocal } from "$lib/store";
import { post } from "$lib/utils";
import { get } from "svelte/store";

export const arkServerUrl = {
  bitcoin: "https://arkade.computer",
  regtest: "http://localhost:7070",
}[PUBLIC_COINOS_NETWORK || "regtest"];
export const arkkey = persistLocal("arkkey", "");

let arkSdkPromise: Promise<typeof import("@arkade-os/sdk")> | undefined;
const loadArkSdk = () => (arkSdkPromise ||= import("@arkade-os/sdk"));

let walletInstance: any;
let walletKey: string | undefined;

export const getWallet = async () => {
  const key = get(arkkey);
  if (!key) {
    walletInstance = undefined;
    walletKey = undefined;
    return;
  }
  if (walletInstance && walletKey === key) return walletInstance;

  const { SingleKey, Wallet } = await loadArkSdk();
  const identity = SingleKey.fromHex(key);

  walletInstance = await Wallet.create({
    identity,
    arkServerUrl,
  });
  walletKey = key;
  return walletInstance;
};

export const getAddress = async (): Promise<string> => {
  const wallet = await getWallet();
  return wallet.getAddress();
};

export const getBalance = async (): Promise<{ available: number }> => {
  const wallet = await getWallet();
  return wallet.getBalance();
};

export const getVtxos = async () => {
  const wallet = await getWallet();
  if (!wallet) return [];
  return wallet.getVtxos({ spendableOnly: false });
};

export const syncTransactions = async (aid: string) => {
  const wallet = await getWallet();
  if (!wallet) return;

  const transactions: any[] = [];

  const history = await wallet.getTransactionHistory();
  const historyTxids = new Set<string>();
  console.log("arkSync: history", history.length, history);

  for (const tx of history) {
    if (tx.key.arkTxid) historyTxids.add(tx.key.arkTxid);
    if (tx.key.commitmentTxid) historyTxids.add(tx.key.commitmentTxid);
    transactions.push({
      arkTxid: tx.key.arkTxid || null,
      commitmentTxid: tx.key.commitmentTxid || null,
      amount: tx.type === "RECEIVED" ? tx.amount : -tx.amount,
      settled: tx.settled,
      createdAt: tx.createdAt,
    });
  }

  // Include preconfirmed VTXOs not yet in transaction history
  const vtxos = await wallet.getVtxos({ spendableOnly: false });
  console.log("arkSync: vtxos", vtxos.length, vtxos);
  for (const v of vtxos) {
    if (v.virtualStatus?.state !== "preconfirmed") continue;
    const id = v.arkTxId || v.txid;
    if (!id || historyTxids.has(id)) continue;
    historyTxids.add(id);
    transactions.push({
      arkTxid: v.arkTxId || null,
      commitmentTxid: v.txid || null,
      amount: Number(v.value),
      settled: false,
      createdAt: v.createdAt ? new Date(v.createdAt).getTime() : Date.now(),
    });
  }

  if (!transactions.length) return;

  return post("/post/ark/sync", { transactions, aid });
};

export const vtxoKey = (v: { txid: string; vout: number }) =>
  `${v.txid}:${v.vout}`;

export const getProcessedVtxos = (): Set<string> => {
  try {
    return new Set(
      JSON.parse(localStorage.getItem("processedArkVtxos") || "[]"),
    );
  } catch {
    return new Set();
  }
};

export const addProcessedVtxos = (keys: string[]) => {
  const processed = getProcessedVtxos();
  for (const k of keys) processed.add(k);
  const arr = [...processed].slice(-200);
  localStorage.setItem("processedArkVtxos", JSON.stringify(arr));
};

// Flag to suppress notifyIncomingFunds during sends
export let arkSending = false;

export const sendArk = async (address: string, amount: number) => {
  const wallet = await getWallet();
  if (!wallet) throw new Error("Ark wallet not available");

  // Suppress incoming notifications during send to prevent
  // change VTXOs from being credited as incoming payments
  arkSending = true;

  try {
    const txid = await wallet.sendBitcoin({ address, amount });

    // Mark post-send VTXOs as processed so notifyIncomingFunds
    // ignores change VTXOs from this send
    const vtxos = await wallet.getVtxos({ spendableOnly: false });
    if (vtxos?.length) addProcessedVtxos(vtxos.map(vtxoKey));

    return txid;
  } finally {
    arkSending = false;
  }
};

export const sendArkViaForward = async ({
  serverArkAddress,
  amount,
  aid,
  forward,
  user,
}: {
  serverArkAddress: string;
  amount: number;
  aid: string;
  forward: string;
  user: any;
}) => {
  const txid = await sendArk(serverArkAddress, amount);

  await post("/post/ark/vault-send", { hash: txid, amount, aid });

  const inv = await post("/post/invoice", {
    invoice: { type: "ark", amount, forward, aid },
    user,
  });

  return post("/post/ark/receive", { amount, hash: txid, iid: inv.id });
};

export const settle = async () => {
  const wallet = await getWallet();
  if (!wallet) return;

  const balance = await wallet.getBalance();
  if (!balance.preconfirmed) return;

  await wallet.settle();

  // Mark post-settle VTXOs as processed so notifyIncomingFunds
  // ignores renewed VTXOs (they get new txids after an Ark round)
  const vtxos = await wallet.getVtxos({ spendableOnly: false });
  if (vtxos?.length) addProcessedVtxos(vtxos.map(vtxoKey));
};
