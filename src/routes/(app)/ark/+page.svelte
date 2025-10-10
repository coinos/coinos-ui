<script>
  import { bytesToHex, randomBytes } from "@noble/hashes/utils";
  import { Ramps, SingleKey, Wallet } from "@arkade-os/sdk";
  import { onMount } from "svelte";

  let boardingAddress = $state();
  let wallet;

  onMount(async () => {
    // const secret = bytesToHex(randomBytes(32));
    const secret =
      "35fe135be231e9cac13835853ab07c4a11b8b745c575755df53a3bf5dd146ca1";
    const identity = SingleKey.fromHex(secret);

    // create a wallet instance
    wallet = await Wallet.create({
      identity,
      arkServerUrl: "https://mutinynet.arkade.sh",
    });

    // You can receive bitcoin offchain instantly! No inbound liquidity!
    const address = await wallet.getAddress();
    console.log("Ark Address:", address);

    const balance = await wallet.getBalance();
    // total is spendable in settlement
    console.log("Total :", balance.total);
    // available is spendable in offchain transactions
    console.log("Available :", balance.available);

    const vtxos = await wallet.getVtxos();
    console.log("Number of VTXOs:", vtxos.length);

    // Log important information about each VTXO
    vtxos.forEach((vtxo, index) => {
      console.log(`VTXO #${index + 1}:`);
      console.log(`  ID: ${vtxo.txid}:${vtxo.vout}`);
      console.log(`  Amount: ${vtxo.value} sats`);
      console.log(`  Batch ID: ${vtxo.virtualStatus.batchTxID}`);
      console.log(`  Status: ${vtxo.virtualStatus.state}`); // "preconfirmed" | "settled" | "swept" | "spent";
    });

    // Get boarding UTXOs
    const boardingUtxos = await wallet.getBoardingUtxos();
    console.log("Number of boarding UTXOs:", boardingUtxos.length);

    // Log important information about each boarding UTXO
    boardingUtxos.forEach((utxo, index) => {
      console.log(`Boarding UTXO #${index + 1}:`);
      console.log(`  TXID: ${utxo.txid}`);
      console.log(`  Output Index: ${utxo.vout}`);
      console.log(`  Amount: ${utxo.value} sats`);
      console.log(
        `  Status: ${utxo.status.confirmed ? "Confirmed" : "Unconfirmed"}`,
      );
    });

    // Get a boarding address
    boardingAddress = await wallet.getBoardingAddress();
    console.log("Boarding Address:", boardingAddress);
  });

  const board = async () => {
    console.log("BOARDING");
    const commitmentTxid = await new Ramps(wallet).onboard();

    console.log("Commitment transaction ID:", commitmentTxid);
  };
</script>

{boardingAddress}

<button onclick={board}>Board</button>
