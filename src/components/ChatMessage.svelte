<script lang="ts">
  import { parseContent, isImage, isVideo, isAudio } from "$lib/parseContent";

  let { content, tags = [] }: { content: string; tags?: any[] } = $props();

  // Extract media from imeta tags (NIP-92)
  let imetaMedia = $derived(
    tags
      .filter((t) => t[0] === "imeta")
      .map((t) => ({
        url: t.find((v) => v.startsWith("url "))?.slice(4) || "",
        mime: t.find((v) => v.startsWith("m "))?.slice(2) || "",
      }))
      .filter((m) => m.url),
  );

  $effect(() => {
    console.log("[ChatMessage]", { content, tags: JSON.stringify(tags), imetaMedia: JSON.stringify(imetaMedia) });
  });

  let parts = $derived(parseContent({ content, tags }));

  const truncUrl = (url: string) => {
    const short = url.replace(/^https?:\/\/(www\.)?/, "");
    return short.length > 40 ? short.slice(0, 40) + "..." : short;
  };

  const resolveName = async (pubkey: string): Promise<string> => {
    try {
      const res = await fetch(`/api/users/${pubkey}`);
      if (res.ok) {
        const info = await res.json();
        if (!info.anon && info.username) return `@${info.username}`;
      }
    } catch {}
    return `@${pubkey.slice(0, 8)}...`;
  };
</script>

{#each imetaMedia as media}
  {#if media.mime.startsWith("image/")}
    <a href={media.url} target="_blank" rel="noopener noreferrer">
      <img src={media.url} alt="" class="chat-img" />
    </a>
  {:else if media.mime.startsWith("video/")}
    <!-- svelte-ignore a11y_media_has_caption -->
    <video src={media.url} controls class="chat-video"></video>
  {:else}
    <a href={media.url} target="_blank" rel="noopener noreferrer" class="chat-link">{truncUrl(media.url)}</a>
  {/if}
{/each}

{#each parts as { type, value }}
  {#if type === "text"}
    {value}
  {:else if type === "newline"}
    <br />
  {:else if type === "link"}
    {#if isImage(value.url)}
      <a href={value.url} target="_blank" rel="noopener noreferrer">
        <img src={value.url} alt="" class="chat-img" />
      </a>
    {:else if isVideo(value.url)}
      <!-- svelte-ignore a11y_media_has_caption -->
      <video src={value.url} controls class="chat-video"></video>
    {:else if isAudio(value.url)}
      <audio src={value.url} controls>
        <a href={value.url}>{truncUrl(value.url)}</a>
      </audio>
    {:else}
      <a href={value.url} target="_blank" rel="noopener noreferrer" class="chat-link">{truncUrl(value.url)}</a>
    {/if}
  {:else if type === "topic"}
    <a href={`/tag/${encodeURIComponent(value)}`} class="chat-topic">#{value}</a>
  {:else if type.match(/^nostr:n(profile|pub)$/)}
    {#await resolveName(value.pubkey)}
      <a href={`/${value.pubkey}`} class="chat-mention">@{value.pubkey.slice(0, 8)}...</a>
    {:then name}
      <a href={`/${value.pubkey}`} class="chat-mention">{name}</a>
    {/await}
  {:else if type === "nostr:note"}
    <a href={`/e/${value.id}`} class="chat-link">nostr:{value.entity?.slice(0, 16)}...</a>
  {:else if type === "nostr:nevent"}
    <a href={`/e/${value.id}`} class="chat-link">nostr:{value.entity?.slice(0, 16)}...</a>
  {/if}
{/each}

<style>
  .chat-img {
    max-width: 100%;
    border-radius: 8px;
    margin: 4px 0;
  }

  .chat-video {
    max-width: 100%;
    border-radius: 8px;
    margin: 4px 0;
  }

  .chat-link {
    text-decoration: underline;
    word-break: break-all;
  }

  .chat-topic {
    font-weight: bold;
    color: var(--accent, #6366f1);
  }

  .chat-mention {
    font-weight: bold;
    color: var(--accent, #6366f1);
  }
</style>
