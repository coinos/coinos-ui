<script>
  import Avatar from "$comp/Avatar.svelte";
  import Media from "$comp/Media.svelte";

  let { data } = $props();
  let { author, event, names, parts, zaps } = $derived(data);

  let zap = () => {};
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    Event
  </h1>

  <div class="space-y-5">
    <div class="flex gap-2 items-center">
      <Avatar user={author} size={16} />
      <a href={`/${author.pubkey}`} class="contents">
        <div>
          <div class="font-bold">
            {author.display} &mdash; {author.username}
          </div>
          <div class="flex items-center">
            <iconify-icon
              noobserver
              icon="ph:lightning-fill"
              class="text-yellow-300"
            ></iconify-icon>
            {author.lud16}
          </div>
        </div>
      </a>
    </div>

    <div class="text-2xl space-y-5 break-words">
      {#each parts as { type, value }, i}
        {#if type === "text"}
          {value}
        {:else if type === "link"}
          <Media {value} />
        {:else if type.match(/^nostr:np(rofile|ub)$/)}
          <a href={`/${value.pubkey}`} class="font-bold"
            >@{names[value.pubkey]}</a
          >
        {/if}
      {/each}
    </div>
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
