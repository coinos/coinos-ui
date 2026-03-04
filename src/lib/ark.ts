import { PUBLIC_COINOS_NETWORK } from "$env/static/public";
import { persistLocal } from "$lib/store";
import { post, versions } from "$lib/utils";
import { get } from "svelte/store";

export const arkServerUrl = {
  bitcoin: "https://arkade.computer",
  regtest: "http://localhost:7070",
}[PUBLIC_COINOS_NETWORK || "regtest"];
export const arkkey = persistLocal("arkkey", "");
export const arkaid = persistLocal("arkaid", "");

interface SerializedVtxo {
  txid: string;
  vout: number;
  value: number;
  status: { confirmed: boolean; isLeaf?: boolean };
  virtualStatus: {
    state: "preconfirmed" | "settled" | "swept" | "spent";
    commitmentTxIds?: string[];
    batchExpiry?: number;
  };
  spentBy?: string;
  settledBy?: string;
  arkTxId?: string;
  createdAt: string;
  isUnrolled: boolean;
  isSpent?: boolean;
}

interface ArkVaultSnapshot {
  version: 1;
  cachedAt: string;
  arkServerUrl: string;
  arkInfoRaw: Record<string, any>;
  vtxos: SerializedVtxo[];
  vtxoChains: Record<string, { chain: any[] }>;
  virtualTxs: Record<string, string>;
}

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

export const autoUnlockArk = async () => {
  if (get(arkkey)) return;
  const { getWalletEntropy } = await import("$lib/walletEntropy");
  const entropy = await getWalletEntropy();
  if (!entropy) return;
  try {
    const [{ HDKey }, { entropyToMnemonic, mnemonicToSeed }, { wordlist }] = await Promise.all([
      import("@scure/bip32"),
      import("@scure/bip39"),
      import("@scure/bip39/wordlists/english.js"),
    ]);
    const { bytesToHex } = await import("@noble/hashes/utils.js");
    const ent = new Uint8Array(entropy).slice(0, 16);
    const mnemonic = entropyToMnemonic(ent, wordlist);
    const seed = await mnemonicToSeed(mnemonic);
    const master = HDKey.fromMasterSeed(seed, versions);
    const child = master.derive("m/86'/0'/0'/0/0");
    const key = bytesToHex(child.privateKey!);
    arkkey.set(key);
  } catch (e) {
    console.error("Ark auto-unlock failed:", e);
  }
};


const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export async function cacheVaultSnapshot() {
  try {
    const wallet = await getWallet();
    if (!wallet) return;

    const infoRes = await fetch(`${arkServerUrl}/v1/info`);
    if (!infoRes.ok) return;
    const arkInfoRaw = await infoRes.json();

    const script = toHex(wallet.offchainTapscript.pkScript);
    const vtxosResponse = await wallet.indexerProvider.getVtxos({ scripts: [script] });
    const vtxos = vtxosResponse.vtxos;

    const spendable = vtxos.filter(
      (v: any) => !v.isSpent && v.virtualStatus.state !== "spent",
    );

    const vtxoChains: Record<string, { chain: any[] }> = {};
    const allNonCommitmentTxids = new Set<string>();

    for (const vtxo of spendable) {
      const key = `${vtxo.txid}:${vtxo.vout}`;
      const chainData = await wallet.indexerProvider.getVtxoChain({
        txid: vtxo.txid,
        vout: vtxo.vout,
      });
      vtxoChains[key] = { chain: chainData.chain };

      for (const tx of chainData.chain) {
        if (
          tx.type !== "INDEXER_CHAINED_TX_TYPE_COMMITMENT" &&
          tx.type !== "INDEXER_CHAINED_TX_TYPE_UNSPECIFIED"
        ) {
          allNonCommitmentTxids.add(tx.txid);
        }
      }
    }

    const virtualTxs: Record<string, string> = {};
    const txidArray = Array.from(allNonCommitmentTxids);
    if (txidArray.length > 0) {
      const result = await wallet.indexerProvider.getVirtualTxs(txidArray);
      for (let i = 0; i < txidArray.length; i++) {
        virtualTxs[txidArray[i]] = result.txs[i];
      }
    }

    const serializedVtxos: SerializedVtxo[] = vtxos.map((v: any) => ({
      txid: v.txid,
      vout: v.vout,
      value: v.value,
      status: v.status,
      virtualStatus: v.virtualStatus,
      spentBy: v.spentBy,
      settledBy: v.settledBy,
      arkTxId: v.arkTxId,
      createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : String(v.createdAt),
      isUnrolled: v.isUnrolled,
      isSpent: v.isSpent,
    }));

    const snapshot: ArkVaultSnapshot = {
      version: 1,
      cachedAt: new Date().toISOString(),
      arkServerUrl: arkServerUrl!,
      arkInfoRaw,
      vtxos: serializedVtxos,
      vtxoChains,
      virtualTxs,
    };

    const uid = localStorage.getItem("arkkey:uid");
    const key = uid ? `arkVaultSnapshot:${uid}` : "arkVaultSnapshot";
    localStorage.setItem(key, JSON.stringify(snapshot));
  } catch (e) {
    console.error("[ark] snapshot cache failed:", e);
  }
}

export const subscribeToAsp = (onEvent: () => void) => {
  let es: EventSource | null = null;
  let subId: string | null = null;
  let stopped = false;
  let watchdog: ReturnType<typeof setInterval> | undefined;

  const connect = async () => {
    if (stopped) return;
    es?.close();

    const wallet = await getWallet();
    if (!wallet) return;

    const script = toHex(wallet.offchainTapscript.pkScript);

    const res = await fetch(`${arkServerUrl}/v1/indexer/script/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scripts: [script] }),
    });

    if (!res.ok) throw new Error(`ASP subscribe failed: ${res.statusText}`);
    ({ subscriptionId: subId } = await res.json());

    es = new EventSource(`${arkServerUrl}/v1/indexer/script/subscription/${subId}`);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event?.newVtxos?.length > 0 || data.event?.spentVtxos?.length > 0) {
          onEvent();
        }
      } catch (e) {
        console.error("[ark] SSE parse error:", e);
      }
    };

    es.onerror = () => {
      // Native EventSource auto-reconnects on transient errors.
      // If the subscription expired server-side, the watchdog below
      // will detect CLOSED state and fully re-subscribe.
    };

  };

  connect().catch((e) => {
    console.error("[ark] SSE initial connect failed:", e);
  });

  // Watchdog: detect CLOSED state (server rejected reconnect) and re-subscribe
  watchdog = setInterval(() => {
    if (stopped) return;
    if (!es || es.readyState === EventSource.CLOSED) {
      console.warn("[ark] SSE dead, re-subscribing...");
      connect().catch((e) => console.error("[ark] SSE reconnect failed:", e));
    }
  }, 30_000);

  return () => {
    stopped = true;
    if (watchdog) clearInterval(watchdog);
    es?.close();
    if (subId) {
      fetch(`${arkServerUrl}/v1/indexer/script/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subId }),
      }).catch(() => {});
    }
  };
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

  const transactions: any[] = [];

  const history = await wallet.getTransactionHistory();
  const historyTxids = new Set<string>();

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

  const result = await post("/api/ark/sync", { transactions, aid, balance, arkAddress: walletAddr });
  cacheVaultSnapshot(); // fire-and-forget
  return result;
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
// Flag to suppress "Received" toasts during vault forward sends
export let vaultForwarding = false;
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
  if (syncPromise) await Promise.race([syncPromise.catch(() => {}), new Promise((r) => setTimeout(r, 3_000))]);

  try {
    // Refresh expired VTXOs before attempting to send
    const balance = await wallet.getBalance();
    if (balance.available < amount && balance.recoverable > 0) {
      await refresh();
    }

    const freshBalance = await wallet.getBalance();
    const preSendTotal = (freshBalance.available || 0) + (freshBalance.preconfirmed || 0);
    if (freshBalance.available < amount) {
      throw new Error(`Insufficient funds: ${freshBalance.available} available, need ${amount}\nLocked balance: ${freshBalance.boarding?.total || 0} boarding, ${freshBalance.preconfirmed || 0} preconfirmed, ${freshBalance.recoverable || 0} recoverable`);
    }

    let txid;
    let sendWallet = wallet;
    // Retry loop for VTXO_ALREADY_REGISTERED — settle() may have registered VTXOs in a
    // pending round. Wait for the round to abort (~5s) so VTXOs become unregistered.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        txid = await withTimeout(
          sendWallet.sendBitcoin({ address, amount }),
          45_000,
          "Ark send",
        );
        break;
      } catch (e: any) {
        if (
          e?.message?.includes("VTXO_ALREADY_REGISTERED") ||
          e?.message?.includes("VTXO_ALREADY_SPENT")
        ) {
          console.log(`ark send attempt ${attempt + 1} failed:`, e.message, "— retrying");
          walletInstance = undefined;
          walletKey = undefined;
          sendWallet = await getWallet();
          if (!sendWallet) throw new Error("Ark wallet not available after refresh");
          const vtxos = await sendWallet.getVtxos({ spendableOnly: false });
          if (vtxos?.length) addProcessedVtxos(vtxos.map(vtxoKey));
          // Wait for the current round to abort before retrying
          if (attempt < 2) await new Promise((r) => setTimeout(r, 6_000));
        } else {
          throw e;
        }
      }
    }
    if (!txid) throw new Error("Ark send failed after retries");

    // Verify the send and mark VTXOs as processed, but don't let
    // stalled SDK calls block the flow — the send already succeeded
    try {
      const postBalance: any = await withTimeout(sendWallet.getBalance(), 10_000, "post-send getBalance");
      const postSendTotal = (postBalance.available || 0) + (postBalance.preconfirmed || 0);
      console.log(
        "ark send: pre-balance",
        preSendTotal,
        "post-balance",
        postSendTotal,
        "amount",
        amount,
        "txid",
        txid,
      );
      if (postSendTotal >= preSendTotal) {
        console.warn("ark send: balance unchanged, but txid was returned — proceeding");
      }
    } catch (e: any) {
      console.warn("ark send: post-send balance check failed:", e.message);
    }

    // Mark post-send VTXOs as processed so notifyIncomingFunds
    // ignores change VTXOs from this send
    try {
      const vtxos: any[] = await withTimeout(sendWallet.getVtxos({ spendableOnly: false }), 10_000, "post-send getVtxos");
      if (vtxos?.length) addProcessedVtxos(vtxos.map(vtxoKey));
    } catch (e: any) {
      console.warn("ark send: post-send getVtxos failed:", e.message);
    }

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
  forward?: string;
  user: any;
}) => {
  vaultForwarding = true;
  try {
    const txid = await sendArk(serverArkAddress, amount);

    await post("/api/ark/vault-send", { hash: txid, amount, aid });

    const invoice: any = { type: "ark", amount, aid };
    if (forward) invoice.forward = forward;

    const inv = await post("/api/invoice", { invoice, user });

    return await post("/api/ark/receive", { amount, hash: txid, iid: inv.id });
  } finally {
    vaultForwarding = false;
  }
};

export const refresh = async () => {
  const wallet = await getWallet();
  if (!wallet) return;

  const { VtxoManager } = await loadArkSdk();
  const balance = await wallet.getBalance();
  const manager = new VtxoManager(wallet);

  let acted = false;

  if (balance.recoverable > 0) {
    await manager.recoverVtxos();
    acted = true;
  }

  const expiring = await manager.getExpiringVtxos();
  if (expiring.length > 0) {
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

// Service Worker wallet for background fund notifications
let swWallet: any;
let swWalletKey: string | undefined;

export const getServiceWorkerWallet = async () => {
  const key = get(arkkey);
  if (!key) {
    await cleanupServiceWorkerWallet();
    return;
  }
  if (swWallet && swWalletKey === key) return swWallet;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return;

  try {
    const { ServiceWorkerWallet, SingleKey } = await loadArkSdk();
    swWallet = await ServiceWorkerWallet.setup({
      serviceWorkerPath: "/service-worker.js",
      arkServerUrl: arkServerUrl!,
      identity: SingleKey.fromHex(key),
    });
    swWalletKey = key;
    return swWallet;
  } catch (e) {
    console.error("[ark] Service worker wallet init failed:", e);
  }
};

export const cleanupServiceWorkerWallet = async () => {
  if (swWallet) {
    try { await swWallet.clear(); } catch {}
  }
  swWallet = undefined;
  swWalletKey = undefined;
};
