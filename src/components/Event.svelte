<script lang="ts">
  import Avatar from "$comp/Avatar.svelte";
  import Media from "$comp/Media.svelte";
  import { goto } from "$app/navigation";
  import { fail, ago, post } from "$lib/utils";
  import { sign } from "$lib/nostr";
  import Pin from "$comp/Pin.svelte";
  import { pin } from "$lib/store";
  import { page } from "$app/stores";

  let amount = 21;
  let { event, minimal = false, last = true, user = undefined }: any = $props();
  let { author, parts, zaps, names, created_at, pubkey } = $derived(event);
  let id = $derived(event.id);

  let zapping = $state();
  let zap = async () => {
    zapping = true;
    try {
      const body = new FormData();

      if (!user) return goto(`/register?redirect=${$page.url.pathname}`);
      let request = await post("/post/zapRequest", { amount, id });
      let { pr: payreq } = await post("/post/zap", {
        event: await sign(request),
      });
      await post("/post/payments", { amount, payreq });
    } catch (e: any) {
      console.log(e);
      fail(e.message);
    }
  };
</script>

{#snippet heading()}
  <div class="flex gap-2 items-center">
    <Avatar user={author} size={16} disabled={true} />
    <div>
      <div>
        <span class="font-bold">{author.displayName}</span>
        <span class="text-secondary">@{author.name}</span>
        <span class="text-secondary">&#x2022; {ago(created_at)}</span>
      </div>
      {#if author.lud16}
        <div class="flex items-center">
          <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300"></iconify-icon>
          {author.lud16}
        </div>
      {/if}
    </div>
  </div>
{/snippet}

<button
  onclick={() => goto(`/e/${id}`)}
  class="space-y-2 dark:border-primary py-8 w-full text-left"
  class:border-b={!last}
>
  {#if minimal}
    {@render heading()}
  {:else}
    <a href={`/${pubkey}/notes`} class="contents">
      {@render heading()}
    </a>
  {/if}

  <div class="text-2xl space-y-2 break-words">
    {#each parts as { type, value }, i}
      {#if type === "text"}
        {value}
      {:else if type === "link"}
        <Media {value} {minimal} />
      {:else if type.match(/^nostr:np(rofile|ub)$/)}
        <a href={`/${value.pubkey}`} class="font-bold">@{names[value.pubkey]}</a>
      {/if}
    {/each}
  </div>
</button>

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

{#if !(minimal || user?.pubkey === pubkey)}
  <div class="justify-center flex">
    <button type="button" onclick={zap} class="btn btn-accent items-center">
      <div class="flex gap-1 items-center">
        <iconify-icon noobserver icon="ph:lightning-fill" class="text-yellow-300" width={32}
        ></iconify-icon>
        <div>Zap</div>
      </div>
    </button>
  </div>
{/if}
