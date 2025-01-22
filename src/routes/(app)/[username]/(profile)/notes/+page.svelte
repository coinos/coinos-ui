<script lang="ts">
  import { t } from "$lib/translations";
  import Event from "$comp/Event.svelte";
  import { get, post } from "$lib/utils";
  import { onMount } from "svelte";
  import { ignore } from "$lib/store";

  let { data } = $props();
  let { events, subject, user } = $derived(data);
</script>

<div class="container px-4 max-w-xl mx-auto space-y-5">
  {#if user?.id === subject.id}
    <a href={`/${user.username}/notes/new`} class="btn">
      <iconify-icon noobserver icon="ph:note-bold" width="32"></iconify-icon>
      <div>Post a note</div>
    </a>
  {/if}
  {#each events as event, i}
    <Event {event} minimal={true} last={i === events.length - 1} {user} />
  {:else}
    <div class="text-2xl">{$t("notes.notFound")}</div>
  {/each}
</div>
