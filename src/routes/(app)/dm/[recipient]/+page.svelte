<script lang="ts">
 import Icon from "$comp/Icon.svelte";
 import { hexToBytes, bytesToHex } from '@noble/hashes/utils';
 import * as toolsnip17 from 'nostr-tools/nip17';
 import { SimplePool } from 'nostr-tools/pool';
 import * as libnip17 from '$lib/nip17';
 import { sign, getPrivateKey } from '$lib/nostr';

 let { data } = $props();
 const { user, recipient } = data;

 const pool = new SimplePool();
 import { PUBLIC_DM_RELAYS } from '$env/static/public';
 const DM_RELAYS_LIST = PUBLIC_DM_RELAYS.split(',');
 const DM_FETCH_LIMIT = 256;

 let text = $state("");
 let events = $state([]);

 const loadEvents = () => {
   const filter = { kinds: [1059], "#p": [user.pubkey], limit: DM_FETCH_LIMIT };
   pool.querySync(DM_RELAYS_LIST, filter).then(wrapped =>
     Promise.all(wrapped.map(decryptMessage))
            .then(rumours => {
              events = rumours;
              events.sort((ev1, ev2) => ev1.created_at - ev2.created_at);
   }));
 }

 loadEvents();

 const btnCreateMessage = async () => {
   let event1, event2;
   if (window.nostr) {
     event1 = await libnip17.createNIP17MessageNIP07(
       text, user.pubkey, recipient.pubkey);
     event2 = await libnip17.createNIP17MessageNIP07(
       text, user.pubkey, recipient.pubkey, user.pubkey);
   } else {
     const sk = await getPrivateKey(user);
     event1 = libnip17.createNIP17MessageSK(text, sk, recipient.pubkey);
     event2 = libnip17.createNIP17MessageSK(
       text, sk, recipient.pubkey, user.pubkey);
   }

   const p1 = Promise.any(pool.publish(DM_RELAYS_LIST, event1));
   const p2 = Promise.any(pool.publish(DM_RELAYS_LIST, event2));
   await Promise.all([p1, p2]);
   loadEvents();
 }

 const decryptMessage = async (event: object): object => {
   if (window.nostr) {
     return await libnip17.decryptNIP17MessageNIP07(event);
   } else {
     const sk = await getPrivateKey(user);
     return toolsnip17.unwrapEvent(event, sk);
   }
 }

 const dmName = (pubkey: string): string => {
   if (pubkey === user.pubkey) {
     return user.username;
   } else if (pubkey === recipient.pubkey) {
     return recipient.username;
   } else {
     return pubkey;
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
        <p>You are sending nostr messages to {recipient.username}.</p>

        <p>Past Messages:</p>
        <ul>
            {#each events as evt}
                {#if evt.pubkey === recipient.pubkey || evt.pubkey === user.pubkey}
                    <li>[{new Date(evt.created_at * 1000).toISOString()}] {dmName(evt.pubkey)}: {evt.content}</li>
                {/if}
            {/each}
        </ul>

        <textarea id="message-contents" bind:value={text}></textarea>

        <input type="button" class="btn" value="Send Message" on:click={btnCreateMessage}>
    </div>
</div>
