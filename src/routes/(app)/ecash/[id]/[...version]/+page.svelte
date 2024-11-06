<script>
  import { enhance } from "$app/forms";
  import { copy, sats, f, s } from "$lib/utils";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";

  export let data;
  export let form;

  let link = $page.url.href;
  let { id, total, version, token, external, spent } = data;
</script>

{#if form?.error}
  <div class="mb-5">
    <div class="text-red-600">
      {form.error === "default" ? $t("error.unrecognizedInput") : form.error}
    </div>
  </div>
{/if}

<div class="flex flex-wrap gap-2 text-xl">
  <button type="button" class="btn" on:click={() => copy(link)}>
    <iconify-icon icon="ph:link-bold" width="32" />
    <div class="my-auto">{$t("payments.shareLink")}</div>
  </button>

  {#if spent < total}
    {#if external}
      <a href={`/ecash/${id}/swap`} class="contents">
        <button type="submit" class="btn">
          <iconify-icon
            icon="ph:hand-coins-bold"
            width="32"
            flip="horizontal"
          />
          <div class="my-auto">{$t("payments.swap")}</div>
        </button>
      </a>
    {:else}
      <form method="POST" use:enhance class="w-full">
        <input type="hidden" name="token" bind:value={token} />
        <button type="submit" class="btn">
          <iconify-icon
            icon="ph:hand-coins-bold"
            width="32"
            flip="horizontal"
          />
          <div class="my-auto">{$t("payments.redeem")}</div>
        </button>
      </form>
    {/if}
  {/if}

  <button
    class="btn break-all !h-auto py-5 font-normal leading-normal"
    on:click={() => copy(token)}
  >
    {token}
  </button>

  {#if version === 4}
    <a data-sveltekit-reload href={`/ecash/${id}/3`} class="contents">
      <button type="button" class="btn">
        <iconify-icon icon="ph:gear-bold" width="32" />
        <div class="my-auto">{$t("payments.legacyVersion")}</div>
      </button>
    </a>
  {:else}
    <a data-sveltekit-reload href={`/ecash/${id}`} class="contents">
      <button type="button" class="btn">
        <iconify-icon icon="ph:gear-bold" width="32" />
        <div class="my-auto">{$t("payments.newVersion")}</div>
      </button>
    </a>
  {/if}
</div>
