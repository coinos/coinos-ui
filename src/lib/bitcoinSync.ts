import { post } from "$lib/utils";

let syncing = false;

export const syncBitcoinVault = async (aid: string) => {
  if (syncing) return;
  syncing = true;
  try {
    return await post("/post/bitcoin/sync", { aid });
  } finally {
    syncing = false;
  }
};
