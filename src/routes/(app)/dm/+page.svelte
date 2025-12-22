<script lang="ts">
 import { isValid } from "nostr-tools/nip05";
 import { t } from "$lib/translations";
 import { pTagKeys } from '$lib/nostr';
 import { getNostrUserInfo } from '$lib/nip01';
 import { getMessageRumours } from '$lib/nip17';

 let { data } = $props();
 const { user } = data;

 const usernameFromPubkey = async (pubkey: string): string => {
   const response = await fetch(`/api/users/${pubkey}`);
   if (response.ok) {
     const userInfo = await response.json();
     return userInfo.username;
   } else {
     return null;
   }
 }

 const userInfo = async (pubkey: string) => {
   const nostrUserInfo = await getNostrUserInfo(pubkey);
   const valid = await isValid(pubkey, nostrUserInfo.nip05);
   const username = await usernameFromPubkey(pubkey);
   return { name: username || nostrUserInfo.name, nip05: nostrUserInfo.nip05, valid, pubkey };
 }

 const updateSendersRecipients = async (rumours: object[]) => {
   const senders = new Set<object>();
   const recipients = new Set<object>();
   for (const rumour of rumours) {
     if (rumour.pubkey !== user.pubkey) {
       senders.add(await userInfo(rumour.pubkey));
     } else {
       for (const pubkey of pTagKeys(rumour)) {
         recipients.add(await userInfo(pubkey));
       }
     }
   }
   messageSenders = Array.from(senders);
   messageRecipients = Array.from(recipients);

   const chatMap = new Map<string, object>();
   for (const sender of senders) {
     chatMap.set(sender.pubkey, sender);
   }
   for (const recipient of recipients) {
     chatMap.set(recipient.pubkey, recipient);
   }
   chats = Array.from(chatMap.values());
 };

 let messageSenders = $state([]);
 let messageRecipients = $state([]);
 let chats = $state([]);
 getMessageRumours(user).then(updateSendersRecipients);

 let selectedChat = $state(null);
</script>

<style>
 .invalid {
     text-decoration: line-through;
 }

 .super-container {
     display: flex;
 }

 .sidebar {
     max-width: 300px;
     margin: 0px 10px;
 }

 .chat-btn {
     min-height: 100px;
     border: 1px solid;
     padding: 10px;
 }

 .main {
     padding-left: 0px;
     margin-left: auto;
 }

 .secondary {
     color: #7f7f7f;
 }
</style>

<div class="super-container">
    <div class="sidebar">
        {#each chats as c}
         <button class="chat-btn" on:click={() => selectedChat = c.name}>
             <span class="text-xl">{c.name}</span> <span class={(c.valid ? "" : "invalid ") + "secondary"}>{c.nip05}</span>{#if c.valid} &#x2713;{/if}
         </button>
        {/each}
    </div>
    <div class="main container space-y-2 mx-auto space-y-5 lg:max-w-xl xl:max-w-2xl lg:pl-10 mt-5 lg:mt-0">
        <h1
          class="text-5xl font-medium text-left w-full mx-auto lg:mx-0 md:w-[500px]"
        >{$t("dm.header")}</h1>

        <p>You are talking to {selectedChat}.</p>

        {#if selectedChat}
            <iframe src="./dm/{selectedChat}"
            width="100%"
            height="100%">
            </iframe>
        {/if}
    </div>
</div>
