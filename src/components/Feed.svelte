<script>
  import { t } from "$lib/translations";
  import { onMount } from "svelte";
  import Event from "$comp/Event.svelte";
  import { browser } from "$app/environment";
  import VirtualScroll from "svelte-virtual-scroll-list";
  import { fail } from "$lib/utils";
  import { sign, send } from "$lib/nostr";

  export let events;
  export let user = undefined;

  let message;

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

  $: sorted = Object.values(events)
    .filter((ev) => ev?.pubkey && ev?.kind === 1)
    .sort((a, b) => b.seen - a.seen);
</script>

{#if user}
  <form
    on:submit|preventDefault={submit}
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
      let:data
      pageMode={true}
      estimateSize={200}
    >
      <a href={`/${data.user.pubkey}/event/${data.id}`}>
        <Event event={data} />
      </a>
    </VirtualScroll>
  {:else}
    <div class="flex w-full">
      <div class="mx-auto text-secondary">{$t("user.noNotes")}</div>
    </div>
  {/if}
{/if}
