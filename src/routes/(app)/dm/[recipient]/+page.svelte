<script lang="ts">
 import Icon from "$comp/Icon.svelte";
 import { hexToBytes } from '@noble/hashes/utils';
 import * as nip17 from 'nostr-tools/nip17';
 import { createNIP17Message } from '$lib/nip17';

 let { data } = $props();
 const { recipient } = data;

 let senderSK, overridePK, text;

 const btnCreateMessage = () => {
   try {
     const recipientPK = overridePK || recipient.pubkey;
     const skBytes = hexToBytes(senderSK);
     const event = createNIP17Message(text, skBytes, recipientPK);
     console.log(JSON.stringify(event));
   } catch (error) {
     console.log(error);
   }
 }
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
        <p><em>Testing Message:</em> You are sending nostr messages to {recipient.username}.  Their pubkey is <code>{recipient.pubkey}</code>.</p>

        <label for="senderSKInput">(Temp) Sender Secret Key:</label>
        <input id="senderSKInput" bind:value={senderSK}>

        <label for="overridePKInput">(Temp) Override Receiver Public Key:</label>
        <input id="overridePKInput" bind:value={overridePK}>

        <label for="message-contents">Message Contents:</label>
        <textarea id="message-contents" bind:value={text}></textarea>

        <input type="button" class="btn" value="Send Message" on:click={btnCreateMessage}>
    </div>
</div>
