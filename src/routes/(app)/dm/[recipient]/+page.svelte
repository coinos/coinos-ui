<script lang="ts">
 import Icon from "$comp/Icon.svelte";
 import { hexToBytes, bytesToHex } from '@noble/hashes/utils';
 import * as nip17 from 'nostr-tools/nip17';
 import { createNIP17MessageSK, createNIP17MessageNIP07 } from '$lib/nip17';
 import { sign, getPrivateKey } from '$lib/nostr';

 let { data } = $props();
 const { user, recipient } = data;

 let text = $state("");

 const btnCreateMessage = async () => {
   let event;
   if (window.nostr) {
     event = await createNIP17MessageNIP07(
       text, user.pubkey, recipient.pubkey);
   } else {
     const sk = await getPrivateKey(user);
     event = createNIP17MessageSK(text, sk, recipient.pubkey);
   }

   // TODO send event to relays instead of displaying it
   text = JSON.stringify(event);
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
        <p>You are sending nostr messages to {recipient.username}.</p>

        <textarea id="message-contents" bind:value={text}></textarea>

        <input type="button" class="btn" value="Generate Message" on:click={btnCreateMessage}>
    </div>
</div>
