<script lang="ts">
 import { isValid } from "nostr-tools/nip05";
 import { t } from "$lib/translations";
 import { pTagKeys } from '$lib/nostr';
 import { getNostrUserInfo } from '$lib/nip01';
 import { getMessageRumours } from '$lib/nip17';
 import { theme } from "$lib/store";

 let { data } = $props();
 const { user } = data;

 const usernameFromPubkey = async (pubkey: string): string => {
   const response = await fetch(`/api/users/${pubkey}`);
   if (response.ok) {
     const userInfo = await response.json();
     return userInfo.anon ? null : userInfo.username;
   } else {
     return null;
   }
 }

 const userInfo = async (pubkey: string) => {
   const nostrUserInfo = await getNostrUserInfo(pubkey);
   const valid = 'nip05' in nostrUserInfo && await isValid(pubkey, nostrUserInfo.nip05);
   const username = await usernameFromPubkey(pubkey);
   return {
     name: username || nostrUserInfo?.name,
     nip05: nostrUserInfo ? nostrUserInfo.nip05 : null,
     valid, pubkey };
 }

 const rumourInvolves = (rumour: object, pubkey: string) => {
   if (rumour.pubkey === pubkey) {
     return true;
   } else {
     for (const tagPK of pTagKeys(rumour)) {
       if (tagPK === pubkey) {
         return true;
       }
     }
     return false;
   }
 }

 const mostRecentCommunication = (rumours: object[], pubkey: string) => {
   let mostRecentTime = null;
   for (const rumour of rumours.filter((r) => rumourInvolves(r, pubkey))) {
     if (!mostRecentTime || rumour.created_at > mostRecentTime) {
       mostRecentTime = rumour.created_at;
     }
   }
   return mostRecentTime;
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
   chats.sort((a, b) => mostRecentCommunication(rumours, b.pubkey) - mostRecentCommunication(rumours, a.pubkey));
 };

 let messageSenders = $state([]);
 let messageRecipients = $state([]);
 let chats = $state([]);
 $inspect(chats);
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
     padding: 0px 10px 5px;
     margin: 0px 5px;
     height: 100%;
     border-radius: 10px;
 }

 .light-sidebar {
     background-color: #eeeeee;
 }

 .dark-sidebar {
     background-color: #222222;
 }

 .chat-btn {
     min-height: 3em;
     margin: 2px 0px;
     width: 100%;
     border-radius: 10px;
 }

 .chat-header {
     margin: 1em 15px 0.5em;
 }

 .light-chat-btn:hover {
     background-color: #dddddd;
 }

 .dark-chat-btn:hover {
     background-color: #333333;
 }

 .light-selected {
     background-color: #dddddd;
 }

 .dark-selected {
     background-color: #333333;
 }

 .main {
     padding-left: 0px;
     margin-left: 30px;
 }

 .secondary {
     color: #7f7f7f;
 }
</style>

<div class="super-container">
    <div class={"sidebar " + ($theme === "light" ? "light-sidebar" : "dark-sidebar")}>
        <h2 class="text-xl chat-header">Chats</h2>
        {#each chats as c}
            <button class={"chat-btn " + ($theme === "light" ? "light-chat-btn" : "dark-chat-btn") + (selectedChat && selectedChat.pubkey == c.pubkey ? ($theme === "light" ? " light-selected" : " dark-selected") : "")} on:click={() => selectedChat = c}>
                <span class="text-xl">{c.name}</span> <span class={(!c.nip05 || c.valid ? "" : "invalid ") + "secondary text-xs"}>{c.nip05 || c.pubkey.substring(0, 16)}</span>{#if c.valid} &#x2713;{/if}
            </button>
        {/each}
    </div>
    <div class="main container space-y-2 mx-auto space-y-5 lg:max-w-xl xl:max-w-2xl lg:pl-10 mt-5 lg:mt-0">
        <h1
          class="text-5xl font-medium text-left w-full mx-auto lg:mx-0 md:w-[500px]"
        >{$t("dm.header")}</h1>

        {#if selectedChat}
            <p>You are talking to <a href="/dm/{selectedChat.name}">{selectedChat.name}</a>.</p>
        {/if}
    </div>
</div>
