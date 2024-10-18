<script>
  import { onMount } from "svelte";
  import { t } from "$lib/translations";
  import Avatar from "$comp/Avatar.svelte";
  import { browser } from "$app/environment";
  import VirtualScroll from "svelte-virtual-scroll-list";
  import { invalidate } from "$app/navigation";

  export let data;
  let { follows } = data;
  $: refresh(data);
  let refresh = (data) => ({ follows } = data);
</script>

<div class="px-3 md:px-0 w-full md:w-[400px] mx-auto">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    {$t("user.following")}
  </h1>

  {#await follows}
    <div>Loading</div>
  {:then follows}
    {#if follows.length}
      {#if browser}
        <VirtualScroll data={follows} key="pubkey" let:data pageMode={true}>
          <a
            href={`/${data.pubkey}`}
            data-sveltekit-preload-data="tap"
            rel="nofollow"
          >
            <div class="flex py-4 text-lg text-secondary" :key={data.pubkey}>
              <div class="mb-auto mr-2">
                <div class="md:hidden">
                  <Avatar size={12} user={data} disabled={true} />
                </div>
                <div class="hidden md:block">
                  <Avatar size={20} user={data} disabled={true} />
                </div>
              </div>

              <div class="w-full flex pb-1 text-black my-auto">
                <div>
                  <div>{data.display_name || ""}</div>
                  <div class="text-secondary text-base">@{data.name}</div>
                </div>
              </div>
            </div>
          </a>
        </VirtualScroll>
      {/if}
    {:else}
      <div>No follows</div>
    {/if}
  {/await}
</div>
