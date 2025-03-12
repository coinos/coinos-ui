<script>
  import { enhance } from "$app/forms";
  import { copy, sats, f, s } from "$lib/utils";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";

  let { data, form } = $props();

  let link = $page.url.href;
  let { id, total, token, external, spent } = $state(data);

  let peanut = $derived(
    "🥜" +
      Array.from(token)
        .map((char) => {
          const byteValue = char.charCodeAt(0);
          // For byte values 0-15, use Variation Selectors (VS1-VS16): U+FE00 to U+FE0F
          if (byteValue >= 0 && byteValue <= 15) {
            return String.fromCodePoint(0xfe00 + byteValue);
          }

          // For byte values 16-255, use Variation Selectors Supplement (VS17-VS256): U+E0100 to U+E01EF
          if (byteValue >= 16 && byteValue <= 255) {
            return String.fromCodePoint(0xe0100 + (byteValue - 16));
          }
        })
        .join(""),
  );
</script>

{#if form?.error}
  <div class="mb-5">
    <div class="text-red-600">
      {form.error === "default" ? $t("error.unrecognizedInput") : form.error}
    </div>
  </div>
{/if}

<div class="flex flex-wrap gap-2 text-xl">
  <button type="button" class="btn" onclick={() => copy(link)}>
    <iconify-icon noobserver icon="ph:link-bold" width="32"></iconify-icon>
    <div class="my-auto">{$t("payments.shareLink")}</div>
  </button>

  <button type="button" class="btn" onclick={() => copy(peanut)}>
    <iconify-icon noobserver icon="ph:copy-bold" width="32"></iconify-icon>
    <div class="my-auto">Copy {peanut} emoji</div>
  </button>

  {#if spent < total}
    {#if external}
      <a href={`/ecash/${id}/swap`} class="contents">
        <button type="submit" class="btn">
          <iconify-icon
            noobserver
            icon="ph:hand-coins-bold"
            width="32"
            flip="horizontal"
          ></iconify-icon>
          <div class="my-auto">{$t("payments.swap")}</div>
        </button>
      </a>
    {:else}
      <form method="POST" use:enhance class="w-full">
        <input type="hidden" name="token" bind:value={token} />
        <button type="submit" class="btn">
          <iconify-icon
            noobserver
            icon="ph:hand-coins-bold"
            width="32"
            flip="horizontal"
          ></iconify-icon>
          <div class="my-auto">{$t("payments.redeem")}</div>
        </button>
      </form>
    {/if}
  {/if}

  <button
    class="btn break-all !h-auto py-5 font-normal leading-normal"
    onclick={() => copy(token)}
  >
    {token}
  </button>
</div>
