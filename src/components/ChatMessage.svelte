<script lang="ts">
  import { parseContent, isImage, isVideo, isAudio } from "$lib/parseContent";

  let {
    content,
    tags = [],
    decryptMedia,
  }: {
    content: string;
    tags?: any[];
    decryptMedia?: (tag: string[]) => Promise<string>;
  } = $props();

  // Detect MIP-04 encrypted media (has "v mip04-v2" field)
  let encryptedMedia = $derived(
    tags.filter(
      (t: string[]) =>
        t[0] === "imeta" &&
        t.some((v) => v === "v mip04-v2") &&
        t.some((v) => v.startsWith("url ")),
    ),
  );

  // Plain (unencrypted) media from imeta tags
  let plainMedia = $derived(
    tags
      .filter(
        (t: string[]) =>
          t[0] === "imeta" &&
          !t.some((v) => v === "v mip04-v2") &&
          t.some((v) => v.startsWith("url ")),
      )
      .map((t: string[]) => ({
        url: t.find((v) => v.startsWith("url "))?.slice(4) || "",
        mime: t.find((v) => v.startsWith("m "))?.slice(2) || "",
      }))
      .filter((m) => m.url),
  );

  // Set of all imeta URLs to suppress duplicate link rendering
  let imetaUrls = $derived(
    new Set([
      ...plainMedia.map((m) => m.url),
      ...encryptedMedia
        .map((t: string[]) => t.find((v) => v.startsWith("url "))?.slice(4) || "")
        .filter(Boolean),
    ]),
  );

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

  const getMime = (tag: string[]): string =>
    tag.find((v) => v.startsWith("m "))?.slice(2) || "image/jpeg";
</script>

{#each encryptedMedia as tag}
  {#if decryptMedia}
    {@const mime = getMime(tag)}
    {#await decryptMedia(tag)}
      <div class="chat-img-placeholder"></div>
    {:then blobUrl}
      {#if mime.startsWith("image/")}
        <a href={blobUrl} target="_blank" rel="noopener noreferrer">
          <img src={blobUrl} alt="" class="chat-img" />
        </a>
      {:else if mime.startsWith("video/")}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video src={blobUrl} controls class="chat-video"></video>
      {:else if mime.startsWith("audio/")}
        <audio src={blobUrl} controls></audio>
      {/if}
    {:catch}
      {@const url = tag.find((v) => v.startsWith("url "))?.slice(4) || ""}
      <a href={url} target="_blank" rel="noopener noreferrer" class="chat-link">{truncUrl(url)}</a>
    {/await}
  {/if}
{/each}

{#each plainMedia as media}
  {#if media.mime.startsWith("image/")}
    <a href={media.url} target="_blank" rel="noopener noreferrer">
      <img src={media.url} alt="" class="chat-img" />
    </a>
  {:else if media.mime.startsWith("video/")}
    <!-- svelte-ignore a11y_media_has_caption -->
    <video src={media.url} controls class="chat-video"></video>
  {:else if media.mime.startsWith("audio/")}
    <audio src={media.url} controls></audio>
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
    {#if imetaUrls.has(value.url)}
      <!-- Already rendered as imeta media above -->
    {:else if isImage(value.url)}
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

  .chat-img-placeholder {
    width: 200px;
    height: 150px;
    border-radius: 8px;
    margin: 4px 0;
    background: var(--bg-secondary, #e5e7eb);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
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
