<script lang="ts">
  export const isImage = (url: string) =>
    url?.match(/^.*\.(jpg|jpeg|png|webp|gif|avif|svg)/gi);
  export const isVideo = (url: string) =>
    url?.match(/^.*\.(mov|mkv|mp4|avi|m4v|webm)/gi);
  export const isAudio = (url: string) => url?.match(/^.*\.(ogg|mp3|wav)/gi);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { value, minimal } = $props();
</script>

<div class="pt-2">
  {#if !!isImage(value.url)}
    <img src={value.url} alt={""} class:w-48={minimal} />
  {:else if isVideo(value.url)}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video src={value.url} controls />
  {:else if isAudio(value.url)}
    <audio src={value.url} controls>
      <a href={value.url}>{value.url.replace(/https?:\/\/(www\.)?/, "")}</a>
    </audio>
  {:else}
    <a href={value.url}>
      {value.url.replace(/https?:\/\/(www\.)?/, "")}
    </a>
  {/if}
</div>
