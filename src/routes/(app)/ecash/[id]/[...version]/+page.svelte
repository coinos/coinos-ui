<script>
  import { enhance } from "$app/forms";
  import { copy, sats, f, s } from "$lib/utils";
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
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
  <button
    type="button"
    class="flex border rounded-2xl px-6 py-5 font-bold hover:opacity-80 w-full justify-center gap-2"
    on:click={() => copy(link)}
  >
    <Icon icon="link" style="w-8 my-auto" />
    <div class="my-auto">{$t("payments.shareLink")}</div>
  </button>

  {#if spent < total}
    {#if external}
      <a href={`/ecash/${id}/swap`} class="contents">
        <button
          type="submit"
          class="flex border rounded-2xl px-6 py-5 font-bold hover:opacity-80 w-full justify-center gap-2"
        >
          <Icon icon="receive" style="w-8 my-auto" />
          <div class="my-auto">{$t("payments.swap")}</div>
        </button>
      </a>
    {:else}
      <form method="POST" use:enhance class="w-full">
        <input type="hidden" name="token" bind:value={token} />
        <button
          type="submit"
          class="flex border rounded-2xl px-6 py-5 font-bold hover:opacity-80 w-full justify-center gap-2"
        >
          <Icon icon="receive" style="w-8 my-auto" />
          <div class="my-auto">{$t("payments.redeem")}</div>
        </button>
      </form>
    {/if}
  {/if}

  <button
    class="border rounded-2xl px-6 py-5 w-full break-all text-xl hover:bg-slate-100"
    on:click={() => copy(token)}
  >
    {token}
  </button>

  {#if version === 4}
    <a data-sveltekit-reload href={`/ecash/${id}/3`} class="contents">
      <button
        type="button"
        class="flex border rounded-2xl px-6 py-5 font-bold hover:opacity-80 w-full justify-center gap-2"
      >
        <Icon icon="settings" style="w-8 my-auto" />
        <div class="my-auto">{$t("payments.legacyVersion")}</div>
      </button>
    </a>
  {:else}
    <a data-sveltekit-reload href={`/ecash/${id}`} class="contents">
      <button
        type="button"
        class="flex border rounded-2xl px-6 py-5 font-bold hover:opacity-80 w-full justify-center gap-2"
      >
        <Icon icon="settings" style="w-8 my-auto" />
        <div class="my-auto">{$t("payments.newVersion")}</div>
      </button>
    </a>
  {/if}
</div>
