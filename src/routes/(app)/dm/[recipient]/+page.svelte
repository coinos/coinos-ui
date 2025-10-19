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

 let relayLists = new Map();

 let text = $state("");
 let messageRumours = $state([]);
 let dates = $state([]);
 let warning = $state(undefined);

 const appendMultimap = (map: Map, key: string, value: object) => {
   if (map.has(key)) {
     map.get(key).push(value);
   } else {
     map.set(key, [value]);
   }
 }

 const zeroPad = (num: number): string => {
   return num < 10 ? '0' + num.toString() : num.toString();
 }

 const timeString = (date: Date): string => {
   const hour = zeroPad(date.getHours());
   const minute = zeroPad(date.getMinutes());
   const second = zeroPad(date.getSeconds());
   return `${hour}:${minute}:${second}`;
 }

 const getPreferredRelays = async (pubkey: string): string[] => {
   if (relayLists.has(pubkey))
     return relayLists.get(pubkey);

   const events = await pool.querySync(
     DM_RELAYS_LIST, { kinds: [10050], limit: 1, authors: [pubkey] }
   );

   let relays = [];
   for (const event of events) {
     for (const tag of event.tags) {
       if (tag.length >= 2 && tag[0] == "relay") {
         relays.push(tag[1]);
       }
     }
   }

   relayLists.set(pubkey, relays);
   return relays;
 }

 const expired = (event: object) => {
   for (const tag of event.tags) {
     if (tag[0] == "expiration") {
       return (Date.now() / 1000) >= Number(tag[1]);
     }
   }
   return false;
 }

 const loadEvents = async (relays: string[]) => {
   const wrapped = await pool.querySync(
     relays, { kinds: [1059], "#p": [user.pubkey], limit: DM_FETCH_LIMIT }
   );

   // intentionally decrypting sequentially to avoid having a bunch of popups
   let decryptedRumours = new Map();
   for (event of wrapped) {
     if (!expired(event)) {
       const rumour = await decryptMessage(event);
       const created = Math.floor(rumour.created_at / 86400);
       appendMultimap(decryptedRumours, created, rumour);
     } else console.log("relay contains expired event", event.id);
   }
   for (const [date, event] of decryptedRumours) {
     event.sort((ev1, ev2) => ev1.created_at - ev2.created_at);
   }

   messageRumours = decryptedRumours;

   dates = Array.from(messageRumours.keys());
   dates.sort((d1, d2) => d1 - d2);
 }

 getPreferredRelays(user.pubkey).then((relays) => {
   if (!relays || relays.length == 0) {
     warning.innerText = "WARNING: You haven't set any preferred relays.  You won't be able to receive any messages or see the messages you've sent.";
     return;
   }
   loadEvents(relays);
 });
 getPreferredRelays(recipient.pubkey).then((relays) => {
   let sendButton = document.getElementById("send-message");
   if (!relays || relays.length == 0) {
     sendButton.disabled = true;
     sendButton.value = `Could not find ${recipient.username}'s DM relays.`;
   }
 });

 const sendMessage = async (message: string) => {
   let event1, event2;
   if (await window.nostr.getPublicKey() === user.pubkey) {
     event1 = await libnip17.createNIP17MessageNIP07(
       message, user.pubkey, recipient.pubkey);
     event2 = await libnip17.createNIP17MessageNIP07(
       message, user.pubkey, recipient.pubkey, user.pubkey);
   } else {
     const sk = await getPrivateKey(user);
     event1 = libnip17.createNIP17MessageSK(
       message, sk, recipient.pubkey);
     event2 = libnip17.createNIP17MessageSK(
       message, sk, recipient.pubkey, user.pubkey);
   }

   console.log(Date.now() / 1000);
   console.log(event2.tags);

   const recipientRelays = await getPreferredRelays(recipient.pubkey);
   const p1 = Promise.any(pool.publish(recipientRelays, event1));
   const senderRelays = await getPreferredRelays(user.pubkey);
   const p2 = Promise.any(pool.publish(senderRelays, event2));
   await Promise.all([p1, p2]);
   getPreferredRelays(user.pubkey).then(loadEvents);
 }

 const decryptMessage = async (event: object): object => {
   if (await window.nostr.getPublicKey() === user.pubkey) {
     return libnip17.decryptNIP17MessageNIP07(event);
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

<style>
 .warning {
     color: #ff7f00;
 }
</style>

<div class="container">
    <a
      class="hover:opacity-80"
      data-sveltekit-preload-data="false"
      href="/{data.recipient.username}"
    >
        <Icon icon="arrow-left" style="w-10" />
    </a>

    <div class="space-y-2 mx-auto space-y-5 lg:max-w-xl xl:max-w-2xl lg:pl-10 mt-5 lg:mt-0">
        <h1
          class="text-5xl font-medium text-left w-full mx-auto lg:mx-0 md:w-[500px]"
        >Direct Messages</h1>
        <p>You are sending nostr messages to {recipient.username}.</p>

        {#each dates as day}
            <p>[{new Date(day * 86400 * 1000).toDateString()}]</p>
            <ul>
                {#each messageRumours.get(day) as rumour}
                    {#if rumour.pubkey === recipient.pubkey || rumour.pubkey === user.pubkey}
                        <li>{timeString(new Date(rumour.created_at * 1000))} {dmName(rumour.pubkey)}: {rumour.content}</li>
                    {/if}
                {/each}
            </ul>
        {/each}

        <textarea id="message-contents" bind:value={text}></textarea>

        <input id="send-message" type="button" class="btn" value="Send Message" on:click={async () => sendMessage(text)}>
        <em><p class="warning" bind:this={warning}></p></em>
    </div>
</div>
