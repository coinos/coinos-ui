<script lang="ts">
  import Event from "$comp/Event.svelte";
  import { get, post } from "$lib/utils";
  import { onMount, onDestroy } from "svelte";
  import { page } from "$app/state";

  let tag = $derived(decodeURIComponent(page.params.tag!));
  let events: any[] = $state([]);
  let paused = $state(false);
  let pause = (e) => {
    e.preventDefault();
    e.stopPropagation();
    paused = true;
  };
  let unpause = (e) => {
    e.preventDefault();
    e.stopPropagation();
    paused = false;
  };

  let sub: any;

  onMount(async () => {
    const { Relay } = await import("nostr-tools/relay");
    const relay = await Relay.connect("wss://relay.primal.net");
    sub = relay.subscribe([{ kinds: [1], "#t": [tag], limit: 50 }], {
      async onevent(event: any) {
        if (paused) return;
        if (events.find((e) => e.id === event.id)) return;
        const { parts, names } = await post("/api/parseEvent", { event });
        event.author = await get(`/api/users/${event.pubkey}`);
        event.parts = parts;
        event.names = names;
        events = [...events, event].sort((a, b) => b.created_at - a.created_at).slice(0, 50);
      },
    });
  });

  onDestroy(() => sub?.close());
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">#{tag}</h1>

  <div onpointerenter={pause} onpointerleave={unpause} role="feed">
    {#each events as event (event.id)}
      <Event {event} minimal={true} />
    {/each}
  </div>
</div>
