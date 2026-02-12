<script lang="ts">
  import { enhance } from "$app/forms";
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

  let { form } = $props();

  const address = 0x3d0000;
  const baudrate = 921600;

  let file = $state();
  let ssid = $state();
  let key = $state();
  let username = $state();
  let password = $state();
  let esploader = $state();
  let data = $derived(form ? hex.decode(form.data) : undefined);

  let chip, transport;
  let ESPLoader;
  let Transport;
  // let data = $state();
  let connect = async () => {
    try {
      if (!ESPLoader || !Transport) {
        ({ ESPLoader, Transport } = await import("esptool-js"));
      }
      let device = await (navigator as any).serial.requestPort({});
      transport = new Transport(device, true);

      esploader = new ESPLoader({
        transport,
        baudrate,
      });

      chip = await (esploader as any).main();
    } catch (e) {
      console.log(e);
    }
  };

  let progress = $state();
  let flash = async () => {
    let fileArray = [{ data: bs(data), address }];

    const flashOptions = {
      fileArray,
      flashSize: "keep",
      eraseAll: false,
      compress: true,
      reportProgress: (fileIndex, written, total) => {
        progress = parseInt(String((written / total) * 100));
      },
    };

    await (esploader as any).writeFlash(flashOptions);
  };
</script>

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">Printer</h1>

  {#if esploader}
    {#if data}
      {#if progress}
        <div class="text-center text-2xl">Done!</div>
      {:else}
        <div>
          Generated config file (
          <b>{data.length * 2} bytes</b>
          )
        </div>
        <button class="btn" onclick={flash}>Flash</button>
      {/if}
    {:else}
      <form method="POST" use:enhance class="space-y-2">
        <input name="ssid" bind:value={ssid} placeholder="wifi ssid" />
        <input name="key" bind:value={key} placeholder="wifi pass" />
        <input name="username" bind:value={username} placeholder="coinos username" />
        <input name="password" bind:value={password} placeholder="coinos password" />
        <button type="submit" class="btn">Generate Config</button>
      </form>
    {/if}
  {:else}
    <button class="btn" onclick={connect}>Connect</button>
  {/if}
</div>
