<script>
  import Avatar from "$comp/Avatar.svelte";
  let { data } = $props();
  let { author, event, zaps } = $derived(data);

  let zap = () => {};
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5 break-words">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    Event
  </h1>
  <div class="flex items-center gap-2 text-2xl">
    <Avatar user={author} size={16} />
    <div>{event.content}</div>
  </div>
  <a href={`/send/zap/${event.pubkey}/${event.id}`} class="btn btn-accent">
    <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300"
    ></iconify-icon>
    Zap
  </a>
  <div class="flex flex-wrap gap-2">
    {#each zaps as { amount, user }}
      <a href={`/${user.pubkey}`}>
        <div class="flex gap-1 items-center">
          <Avatar {user} size={8} disabled={true} />
          <div>{amount}</div>
        </div>
      </a>
    {/each}
  </div>
</div>
