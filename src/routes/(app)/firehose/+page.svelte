<script lang="ts">
  import Event from "$comp/Event.svelte";
  import { get, post } from "$lib/utils";
  import { onMount } from "svelte";
  import { ignore } from "$lib/store";

  let events = $state([]);
  let paused = $state();
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

  onMount(async () => {
    const { Relay } = await import("nostr-tools/relay");
    const relay = await Relay.connect("wss://relay.primal.net");
    const subscription = relay.subscribe([{ kinds: [1], limit: 20 }], {
      async onevent(event) {
        if (paused) return;
        const { parts, names } = await post("/post/parseEvent", { event });
        event.author = await get(`/api/users/${event.pubkey}`);
        event.parts = parts;
        event.names = names;
        events.push(event);
        if (events.length > 20) events.shift();
      },
    });
  });
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    Events
  </h1>

  <div onpointerenter={pause} onpointerleave={unpause}>
    {#each events as event}
      <Event {event} minimal={true} />
    {/each}
  </div>
</div>
