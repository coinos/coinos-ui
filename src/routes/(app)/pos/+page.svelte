<script>
  import { enhance } from "$app/forms";
  import { ESPLoader, Transport } from "esptool-js";
  import { hex } from "@scure/base";

  function bs(uint8Array) {
    let binaryString = "";
    const chunkSize = 0x8000; // 32,768 bytes (safe limit)

    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binaryString += String.fromCharCode(...chunk);
    }

    return binaryString;
  }

  let { data, form } = $props();
  let { token } = $state(data);

  const address = 0x3d0000;
  const baudrate = 921600;

  let file = $state();
  let ssid = $state();
  let key = $state();
  let esploader = $state();
  let bytes = $derived(form ? hex.decode(form.bytes) : undefined);

  let chip, transport;
  let connect = async () => {
    try {
      let device = await navigator.serial.requestPort({});
      transport = new Transport(device, true);

      esploader = new ESPLoader({
        transport,
        baudrate,
      });

      chip = await esploader.main();
    } catch (e) {
      console.log(e);
    }
  };

  let progress = $state();
  let flash = async () => {
    let fileArray = [{ data: bs(bytes), address }];

    const flashOptions = {
      fileArray,
      flashSize: "keep",
      eraseAll: false,
      compress: true,
      reportProgress: (fileIndex, written, total) => {
        progress = parseInt((written / total) * 100);
      },
    };

    await esploader.writeFlash(flashOptions);
  };
</script>

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    Flash config
  </h1>

  {#if esploader}
    {#if bytes}
      {#if progress}
        <div class="text-center text-2xl">Done!</div>
      {:else}
        <div>Generated config file (<b>{bytes.length * 2} bytes</b>)</div>
        <button class="btn" onclick={flash}>Flash</button>
      {/if}
    {:else}
      <form method="POST" use:enhance class="space-y-2">
        <input
          name="ssid"
          bind:value={ssid}
          placeholder="Wifi SSID"
          class="input"
        />
        <input
          name="key"
          bind:value={key}
          placeholder="Wifi password"
          class="input"
        />
        <input
          name="token"
          bind:value={token}
          placeholder="Coinos API token"
          class="input"
        />
        <button type="submit" class="btn">Generate Config</button>
      </form>
    {/if}
  {:else}
    <button class="btn" onclick={connect}>Connect</button>
  {/if}
</div>
