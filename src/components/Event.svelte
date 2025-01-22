<script>
  import Avatar from "$comp/Avatar.svelte";
  import Media from "$comp/Media.svelte";
  import { goto } from "$app/navigation";
  import { fail, ago, post } from "$lib/utils";
  import { sign } from "$lib/nostr";
  import Pin from "$comp/Pin.svelte";
  import { pin } from "$lib/store";

  let amount = 21;
  let { event, minimal, last } = $props();
  let { author, parts, zaps, names, created_at } = $derived(event);
  let { id } = event;

  let zapping = $state();
  let zap = async () => {
    zapping = true;
    try {
      const body = new FormData();

      let request = await post("/post/zapRequest", { amount, id });
      let { pr: payreq } = await post("/post/zap", {
        event: await sign(request),
      });
      await post("/post/payments", { amount, payreq });
    } catch (e) {
      fail(e.message);
    }
  };
</script>

<div class="space-y-2 dark:border-primary py-8" class:border-b-8={!last}>
  <div class="flex">
    <a href={`/${author.pubkey}/notes`} class="contents">
      <div class="flex gap-2 items-center">
        <Avatar user={author} size={16} disabled={true} />
        <div>
          <div>
            <span class="font-bold">{author.display}</span>
            <span class="text-secondary">@{author.username}</span>
            <span class="text-secondary">&#x2022; {ago(created_at)}</span>
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
      </div>
    </a>
  </div>

  <a href={`/e/${id}`} class="contents">
    <div class="text-2xl space-y-2 break-words">
      {#each parts as { type, value }, i}
        {#if type === "text"}
          {value}
        {:else if type === "link"}
          <Media {value} {minimal} />
        {:else if type.match(/^nostr:np(rofile|ub)$/)}
          <a href={`/${value.pubkey}`} class="font-bold"
            >@{names[value.pubkey]}</a
          >
        {/if}
      {/each}
    </div>
  </a>
</div>

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

{#if !minimal}
  <div class="justify-center flex">
    <btn onclick={zap} class="btn btn-accent items-center">
      <div class="flex gap-1 items-center">
        <iconify-icon
          noobserver
          icon="ph:lightning-fill"
          class="text-yellow-300"
          width={32}
        ></iconify-icon>
        <div>Zap</div>
      </div>
    </btn>
  </div>
{/if}
