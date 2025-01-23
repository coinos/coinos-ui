<script>
  import { t } from "$lib/translations";
  import Avatar from "$comp/Avatar.svelte";
  import { browser } from "$app/environment";
  import VirtualScroll from "svelte-virtual-scroll-list";

  let { data } = $props();
  let { followers } = $derived(data);
</script>

<div class="px-3 md:px-0 w-full md:w-[400px] mx-auto space-y-5">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    {$t("user.followers")}
  </h1>

  {#await followers}
    <div>Loading followers...</div>
  {:then followers}
    {#if followers.length}
      <VirtualScroll data={followers} key="pubkey" pageMode={true}>
        {#snippet children({ data })}
          <a
            href={`/${data.pubkey}`}
            data-sveltekit-preload-data="tap"
            rel="nofollow"
          >
            <div
              class="flex border-b last:border-b-0 py-4 text-2xl text-secondary"
              :key={data.pubkey}
            >
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
                  <div>{data.display || data.display_name || ""}</div>
                  <div class="text-secondary text-base">
                    @{data.username || data.name}
                  </div>
                </div>
              </div>
            </div>
          </a>
        {/snippet}
      </VirtualScroll>
    {:else}
      <div>No followers</div>
    {/if}
  {/await}
</div>
