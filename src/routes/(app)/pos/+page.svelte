<script>
  import { enhance } from "$app/forms";
  import { ESPLoader, Transport } from "esptool-js";
  import { hex } from "@scure/base";

  // Convert Uint8Array → JS "binary string" in safe chunks
  function bs(uint8Array) {
    let binaryString = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binaryString += String.fromCharCode(...chunk);
    }
    return binaryString;
  }

  let { data, form } = $props();
  let { token } = $state(data);

  // --- Defaults ---
  const LITTLEFS_ADDRESS_DEFAULT = 0x3d0000; // your existing LittleFS offset
  const FW_ADDRESS_DEFAULT = 0x10000;        // typical app offset on ESP32-C3
  const CONNECT_BAUD = 115200;               // initial
  const WORK_BAUD = 921600;                  // fast flashing

  // --- Shared state ---
  let esploader = $state();
  let chip, transport;
  let connected = $state(false);
  let portInfo = $state("");

  // --- Existing config path (generated server-side to hex in form.bytes) ---
  let bytes = $derived(form ? hex.decode(form.bytes) : undefined);
  let littlefsAddress = $state(LITTLEFS_ADDRESS_DEFAULT);
  let configProgress = $state(0);
  let configDone = $state(false);

  // --- New firmware flashing path ---
  let fwFile = $state(null);
  let fwBytes = $state();             // Uint8Array
  let fwAddress = $state(FW_ADDRESS_DEFAULT);
  let fwEraseAll = $state(false);
  let fwProgress = $state(0);
  let fwDone = $state(false);
  let fwError = $state("");

  // Simple tab toggle
  let tab = $state("config"); // "config" | "firmware"

  let connect = async () => {
    try {
      const device = await navigator.serial.requestPort({});
      transport = new Transport(device, true);
      esploader = new ESPLoader({
        transport,
        baudrate: CONNECT_BAUD,
      });

      chip = await esploader.main();

      connected = true;
      portInfo = (await device.getInfo?.()) ? JSON.stringify(await device.getInfo()) : "Connected";
    } catch (e) {
      console.log(e);
      connected = false;
    }
  };

  let flashConfig = async () => {
    if (!esploader || !bytes) return;
    configDone = false;
    configProgress = 0;

    const fileArray = [{ data: bs(bytes), address: Number(littlefsAddress) }];

    await esploader.writeFlash({
      fileArray,
      flashSize: "keep",
      eraseAll: false,
      compress: true,
      reportProgress: (_fileIndex, written, total) => {
        configProgress = Math.floor((written / total) * 100);
      },
    });

    configDone = true;
  };

  function onPickFw(e) {
    fwError = "";
    fwDone = false;
    const f = e.target.files?.[0];
    fwFile = f || null;
    if (!fwFile) {
      fwBytes = undefined;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const buf = new Uint8Array(reader.result);
      fwBytes = buf;
    };
    reader.onerror = () => {
      fwError = "Failed to read file.";
      fwBytes = undefined;
    };
    reader.readAsArrayBuffer(fwFile);
  }

  let flashFirmware = async () => {
    if (!esploader) {
      fwError = "Not connected.";
      return;
    }
    if (!fwBytes?.length) {
      fwError = "No firmware selected.";
      return;
    }
    fwError = "";
    fwDone = false;
    fwProgress = 0;

    try {
      const fileArray = [{ data: bs(fwBytes), address: Number(fwAddress) }];

      await esploader.writeFlash({
        fileArray,
        flashSize: "keep",
        eraseAll: Boolean(fwEraseAll),
        compress: true,
        reportProgress: (_fileIndex, written, total) => {
          fwProgress = Math.floor((written / total) * 100);
        },
      });

      fwDone = true;
    } catch (e) {
      console.error(e);
      fwError = e?.message || "Flash failed.";
    }
  };
</script>

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    ESP32-C3 Flasher
  </h1>

  {#if !connected}
  <div class="text-center">
    <button class="btn" onclick={connect}>Connect</button>
    <div class="text-sm mt-2 opacity-70">{portInfo}</div>
  </div>
{/if}

  {#if connected}
    <!-- Tabs -->
    <div class="flex gap-2 justify-center">
      <button class="btn" class:btn-neutral={tab === "config"} onclick={() => (tab = "config")}>Flash config</button>
      <button class="btn" class:btn-neutral={tab === "firmware"} onclick={() => (tab = "firmware")}>Flash firmware</button>
    </div>

    {#if tab === "config"}
      <!-- Existing CONFIG FLOW -->
      {#if bytes}
        {#if configDone}
          <div class="text-center text-2xl">Config written ✔</div>
        {:else}
          <div>Generated config file (<b>{bytes.length} bytes</b>)</div>
          <label class="label mt-2">LittleFS address (hex)</label>
            <input class="input" bind:value={littlefsAddress} onchange={(e) => (littlefsAddress = Number(e.target.value))} />
          <div class="mt-3">
            <button class="btn" onclick={flashConfig}>Flash config</button>
          </div>
          {#if configProgress > 0}<div class="mt-2">Progress: {configProgress}%</div>{/if}
        {/if}
      {:else}
        <form method="POST" use:enhance class="space-y-2">
          <input name="ssid" placeholder="Wifi SSID" class="input" />
          <input name="key" placeholder="Wifi password" class="input" />
          <input name="token" bind:value={token} placeholder="Coinos API token" class="input" />
          <button type="submit" class="btn">Generate Config</button>
        </form>
      {/if}
    {:else}
      <!-- NEW FIRMWARE FLOW -->
      <div class="space-y-3">
        <label class="label">Select .ino.bin (firmware)</label>
        <input type="file" accept=".bin,application/octet-stream" class="input" onchange={onPickFw} />

        <label class="label">Firmware address (hex, default 0x10000)</label>
        <input class="input" bind:value={fwAddress} onchange={(e) => (fwAddress = Number(e.target.value))} />

        <label class="flex items-center gap-2 mt-2">
          <input type="checkbox" bind:checked={fwEraseAll} />
          <span>Erase all flash (usually NOT needed)</span>
        </label>

        <div class="mt-3">
          <button class="btn" disabled={!fwBytes} onclick={flashFirmware}>Flash firmware</button>
          </div>

        {#if fwProgress > 0 && !fwDone}
          <div>Progress: {fwProgress}%</div>
        {/if}
        {#if fwDone}
          <div class="text-center text-2xl">Firmware written ✔</div>
        {/if}
        {#if fwError}
          <div class="text-red-600">{fwError}</div>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  @reference "../../../app.css";

  .btn { @apply px-4 py-2 rounded-2xl shadow; }
  .btn-neutral { @apply bg-gray-200; }
  .input { @apply w-full px-3 py-2 border rounded-xl; }
  .label { @apply text-sm opacity-70; }
</style>
