<script>
  import { preventDefault } from 'svelte/legacy';

  import { t } from "$lib/translations";
  import { onMount } from "svelte";
  import Event from "$comp/Event.svelte";
  import { browser } from "$app/environment";
  import VirtualScroll from "svelte-virtual-scroll-list";
  import { fail } from "$lib/utils";
  import { sign, send } from "$lib/nostr";

  let { events = $bindable(), user = undefined } = $props();

  let message = $state();

  let submit = async () => {
    try {
      let mnemonic, key, seed, entropy, child, privkey;

      let event = {
        pubkey: user.pubkey,
        created_at: Math.floor(Date.now() / 1000),
        kind: 1,
        content: message,
        tags: [],
      };

      await sign({ event, user });
      await send(event);

      event.user = user;
      event.seen = event.created_at;

      events[event.id] = event;
      events = events;
    } catch (e) {
      console.log(e, e.stack);
      fail("Problem posting event");
    }
  };

  let sorted = $derived(Object.values(events)
    .filter((ev) => ev?.pubkey && ev?.kind === 1)
    .sort((a, b) => b.seen - a.seen));
</script>

{#if user}
  <form
    onsubmit={preventDefault(submit)}
    class="flex justify-center gap-4 max-w-2xl mx-auto"
  >
    <div class="grow">
      <input
        name="message"
        bind:value={message}
        placeholder="What's happening?"
        class="my-5 mx-auto"
      />
    </div>
    <button
      class="rounded-full border py-4 px-5 font-bold hover:opacity-80 w-40 my-5"
      >Post</button
    >
  </form>
{/if}

{#if browser}
  {#if sorted.length}
    <VirtualScroll
      data={sorted}
      key="id"
      
      pageMode={true}
      estimateSize={200}
    >
      {#snippet children({ data })}
            <a href={`/${data.user.pubkey}/event/${data.id}`}>
          <Event event={data} />
        </a>
                {/snippet}
        </VirtualScroll>
  {:else}
    <div class="flex w-full">
      <div class="mx-auto text-secondary">{$t("user.noNotes")}</div>
    </div>
  {/if}
{/if}
