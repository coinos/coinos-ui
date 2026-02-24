import { PUBLIC_COINOS_NETWORK } from "$env/static/public";
import { persistLocal } from "$lib/store";
import { post } from "$lib/utils";
import { get } from "svelte/store";

export const arkServerUrl = {
  bitcoin: "https://arkade.computer",
  regtest: "http://localhost:7070",
}[PUBLIC_COINOS_NETWORK || "regtest"];
export const arkkey = persistLocal("arkkey", "");
export const arkaid = persistLocal("arkaid", "");

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

const _syncTransactions = async (aid: string) => {
  const wallet = await getWallet();
  if (!wallet) return;

  const walletAddr = await wallet.getAddress();
  console.log("arkSync: wallet address", walletAddr);

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

  const bal = await wallet.getBalance();
  const balance = (bal.available || 0) + (bal.preconfirmed || 0);

  return post("/post/ark/sync", { transactions, aid, balance });
};

export const syncTransactions = async (aid: string) => {
  if (arkSending) return;
  const p = _syncTransactions(aid);
  syncPromise = p;
  try {
    return await p;
  } finally {
    if (syncPromise === p) syncPromise = null;
  }
};

export const vtxoKey = (v: { txid: string; vout: number }) => `${v.txid}:${v.vout}`;

export const getProcessedVtxos = (): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem("processedArkVtxos") || "[]"));
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

// Flag to suppress sync during sends
export let arkSending = false;
let syncPromise: Promise<any> | null = null;

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string) =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), ms)),
  ]);

export const sendArk = async (address: string, amount: number) => {
  const wallet = await getWallet();
  if (!wallet) throw new Error("Ark wallet not available");

  // Suppress sync polling and wait for any in-flight sync to finish
  arkSending = true;
  if (syncPromise) await syncPromise.catch(() => {});

  try {
    // Refresh expired VTXOs before attempting to send
    const balance = await wallet.getBalance();
    if (balance.available < amount && balance.recoverable > 0) {
      console.log("ark send: refreshing expired VTXOs before send");
      await refresh();
    }

    const freshBalance = await wallet.getBalance();
    if (freshBalance.available < amount) {
      throw new Error(`Insufficient funds: ${freshBalance.available} available, need ${amount}`);
    }
    let txid;
    try {
      txid = await withTimeout(wallet.sendBitcoin({ address, amount }), 45_000, "Ark send");
    } catch (e: any) {
      if (e?.message?.includes("VTXO_ALREADY_REGISTERED")) {
        await wallet.settle();
        const vtxos = await wallet.getVtxos({ spendableOnly: false });
        if (vtxos?.length) addProcessedVtxos(vtxos.map(vtxoKey));
        txid = await withTimeout(wallet.sendBitcoin({ address, amount }), 45_000, "Ark send retry");
      } else {
        throw e;
      }
    }

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

export const refresh = async () => {
  const wallet = await getWallet();
  if (!wallet) return;

  const { VtxoManager } = await loadArkSdk();
  const balance = await wallet.getBalance();
  console.log("ark refresh: balance", balance);
  const manager = new VtxoManager(wallet);

  let acted = false;

  if (balance.recoverable > 0) {
    console.log("ark refresh: recovering", balance.recoverable, "swept sats");
    await manager.recoverVtxos();
    acted = true;
  }

  const expiring = await manager.getExpiringVtxos();
  if (expiring.length > 0) {
    console.log("ark refresh: renewing", expiring.length, "expiring vtxos");
    await manager.renewVtxos();
    acted = true;
  }

  // Mark post-recovery/renewal VTXOs as processed so notifyIncomingFunds
  // doesn't treat them as new incoming payments
  if (acted) {
    const vtxos = await wallet.getVtxos({ spendableOnly: false });
    if (vtxos?.length) addProcessedVtxos(vtxos.map(vtxoKey));
  }
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
