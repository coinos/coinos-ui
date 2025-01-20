<script>
  import Avatar from "$comp/Avatar.svelte";
  import Media from "$comp/Media.svelte";
  import { goto } from "$app/navigation";

  let { event, minimal } = $props();
  let { author, parts, zaps, names } = $derived(event);
  let go = () => goto(`/e/${event.id}`);
  console.log(event.tags);
</script>

<div class="space-y-5">
  <div class="flex gap-2 items-center">
    <Avatar user={author} size={16} />
    <a href={`/${author.pubkey}/notes`} class="contents">
      <div>
        <div class="font-bold">
          {author.display} &mdash; {author.username}
        </div>
        {#if author.lud16}
          <div class="flex items-center">
            <iconify-icon
              noobserver
              icon="ph:lightning-fill"
              class="text-yellow-300"
            ></iconify-icon>
            {author.lud16}
          </div>
        {/if}
      </div>
    </a>
  </div>

  <div class="text-2xl space-y-5 break-words" onclick={go}>
    {#each parts as { type, value }, i}
      {#if type === "text"}
        {value}
      {:else if type === "link" && !minimal}
        <Media {value} />
      {:else if type.match(/^nostr:np(rofile|ub)$/)}
        <a href={`/${value.pubkey}`} class="font-bold">@{names[value.pubkey]}</a
        >
      {/if}
    {/each}
  </div>
</div>

{#if !minimal}
  <a href={`/send/zap/${event.pubkey}/${event.id}`} class="btn btn-accent">
    <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300"
    ></iconify-icon>
    Zap
  </a>
{/if}

{#if zaps?.length}
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
{/if}
