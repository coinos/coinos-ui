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
      <h1
        class="text-5xl font-medium text-left w-full mx-auto lg:mx-0 md:w-[500px]"
      >Direct Messages</h1>
      <p>You are sending nostr messages to {data.recipient}.</p>

      <textarea id="message-contents"></textarea>

      <input type="button" class="btn" value="Send Message">
  </div>
</div>
