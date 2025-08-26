<script lang="ts">
 let { data } = $props();
 import Icon from "$comp/Icon.svelte";
</script>


<div class="container">
  <a
    class="hover:opacity-80"
    data-sveltekit-preload-data="false"
    href="/{data.recipient}"
  >
    <Icon icon="arrow-left" style="w-10" />
  </a>

  <div class="space-y-2 mx-auto space-y-5 lg:max-w-xl xl:max-w-2xl lg:pl-10 mt-5 lg:mt-0">
      <h1>Nostr Direct Messages</h1>
      <p>You are sending messages to {data.recipient}.</p>
  </div>
</div>
