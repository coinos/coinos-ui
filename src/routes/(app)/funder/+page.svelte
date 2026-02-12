<script lang="ts">
  import { onMount } from "svelte";
  let here = false;
  let ready = false;
  let success = false;
  let controller: AbortController | null = null;
  let NfcWriter: any;

  async function write() {
    NfcWriter = window.Capacitor?.Plugins?.NfcWriter;
    ready = true;
    console.log(window.Capacitor);
    if (!NfcWriter) return;
    here = true;

    try {
      await NfcWriter.enableExclusiveNfcMode();

      if (controller) controller.abort();
      controller = new AbortController();

      ready = true;

      const ndef = new NDEFReader();
      await ndef.write(
        {
          records: [
            {
              recordType: "url",
              data: "https://coinos.io",
            },
          ],
        },
        { signal: controller.signal },
      );

      success = true;
    } catch (err) {
      if (err.name === "AbortError") {
        console.warn("Previous write aborted");
      } else {
        console.error("Write failed", err);
        alert("❌ Write failed: " + err.message);
      }
    } finally {
      await NfcWriter.disableExclusiveNfcMode();
    }
  }
</script>

HI
<button class="p-4 btn" on:click={write}>write</button>
{#if here}HERE{/if}
{#if ready}go{/if}
{#if success}done{/if}
