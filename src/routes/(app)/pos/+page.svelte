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
  let bytes = $derived(form?.bytes ? hex.decode(form.bytes) : undefined);
  let configError = $state("");
  $effect(() => {
    configError = form?.error || "";
  });
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

  // --- Latest published release (see coinos-pos/publish.sh) ---
  /** @type {any} */
  let release = $state(null);        // manifest.json contents
  let releaseError = $state("");
  $effect(() => {
    fetch("/firmware/manifest.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((m) => (release = m))
      .catch((e) => (releaseError = `No published release: ${e.message}`));
  });

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

  // Pulse RTS to hard-reset the chip out of the ROM bootloader so it boots
  // the app with the new flash contents. Same sequence esptool.py uses
  // ("Hard resetting via RTS pin"); on the C3's USB-JTAG-serial port RTS
  // drives EN, so the device re-enumerates and must be reconnected.
  let resetDevice = async () => {
    try {
      await transport.setDTR(false);
      await transport.setRTS(true);
      await new Promise((r) => setTimeout(r, 100));
      await transport.setRTS(false);
    } catch (e) {
      console.warn("reset failed", e);
    }
    try {
      await transport.disconnect();
    } catch (e) {}
    esploader = undefined;
    connected = false;
    portInfo = "Device reset. Reconnect to flash again.";
  };

  let flashConfig = async () => {
    if (!esploader || !bytes) return;
    if (bytes.length !== 0x20000) {
      configError = `Refusing to flash: image is ${bytes.length} bytes, expected ${0x20000}`;
      return;
    }
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
    await resetDevice();
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
      await resetDevice();
    } catch (e) {
      console.error(e);
      fwError = e?.message || "Flash failed.";
    }
  };

  // Flash every part of the published release at its offset (bootloader,
  // partition table, OTA data, app). The LittleFS config partition is not
  // part of the manifest, so device credentials survive.
  let flashRelease = async () => {
    if (!esploader) {
      fwError = "Not connected.";
      return;
    }
    if (!release?.parts?.length) {
      fwError = "No release available.";
      return;
    }
    fwError = "";
    fwDone = false;
    fwProgress = 0;

    try {
      const fileArray = [];
      for (const part of release.parts) {
        const r = await fetch(`${part.path}?v=${encodeURIComponent(release.version)}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`Download failed: ${part.path} (HTTP ${r.status})`);
        const buf = new Uint8Array(await r.arrayBuffer());
        if (part.size && buf.length !== part.size)
          throw new Error(`Size mismatch for ${part.path}: got ${buf.length}, expected ${part.size}`);
        fileArray.push({ data: bs(buf), address: Number(part.address) });
      }

      const totals = fileArray.map((f) => f.data.length);
      const grand = totals.reduce((a, b) => a + b, 0);
      await esploader.writeFlash({
        fileArray,
        flashSize: "keep",
        eraseAll: false,
        compress: true,
        reportProgress: (fileIndex, written, total) => {
          const before = totals.slice(0, fileIndex).reduce((a, b) => a + b, 0);
          fwProgress = Math.floor(((before + (written / total) * totals[fileIndex]) / grand) * 100);
        },
      });

      fwDone = true;
      await resetDevice();
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
    {#if configDone}
      <div class="text-2xl mb-3">Config written ✔ Device restarted</div>
    {:else if fwDone}
      <div class="text-2xl mb-3">Firmware written ✔ Device restarted</div>
    {/if}
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
        {#if configError}
          <div class="text-red-600 mb-2">{configError}</div>
        {/if}
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
        {#if release}
          <div class="p-3 rounded-lg border border-current/20 space-y-2">
            <div class="font-semibold">Latest release: {release.version}</div>
            <div class="text-sm opacity-70">Built {release.built} · flashes bootloader, partitions and app; keeps your wifi/token config</div>
            <button class="btn" onclick={flashRelease}>Flash latest release</button>
          </div>
        {:else if releaseError}
          <div class="text-sm opacity-70">{releaseError}</div>
        {/if}

        <label class="label">Or select a .ino.bin (firmware)</label>
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
