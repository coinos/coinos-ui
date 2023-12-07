<script>
  import { t } from "$lib/translations";
  import { fly } from "svelte/transition";

  import Avatar from "$comp/Avatar.svelte";
  import Icon from "$comp/Icon.svelte";

  import { request, requestRedirect } from "$lib/store";
  import { page } from "$app/stores";

  export let user;

  $requestRedirect = $page.url.pathname;
</script>

{#if $request}
  <div class="fixed bottom-0 border-t w-full p-4 bg-white z-50" in:fly>
    <div class="flex flex-wrap md:flex-nowrap max-w-xl mx-auto gap-2">
      <div class="my-auto mx-auto">
        <div class="flex">
          <Avatar user={$request.requester} size={12} />
          <h1 class="my-auto">
            <b>{$request.requester.username}</b>
            {$t("payments.readyToPay")}
          </h1>
        </div>
      </div>
      <div class="mx-auto my-auto flex gap-2">
        <a href={`/${user.username}/receive/${$request.id}`}>
          <button
            class="rounded-full border py-2 px-4 font-bold hover:opacity-80 w-32">
            {$t("payments.invoice")}
          </button>
        </a>
      </div>
    </div>
  </div>
{/if}
