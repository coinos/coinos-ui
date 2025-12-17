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
   return { name: username || nostrUserInfo.name, nip05: nostrUserInfo.nip05, valid };
 }

 const updateSendersRecipients = async (rumours: object[]) => {
   const senders = new Set<string>();
   const recipients = new Set<string>();
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
 };

 let messageSenders = $state([]);
 let messageRecipients = $state([]);
 getMessageRumours(user).then(updateSendersRecipients);
</script>

<style>
 .invalid {
     text-decoration: line-through;
 }
</style>

<div class="container">
    <div class="space-y-2 mx-auto space-y-5 lg:max-w-xl xl:max-w-2xl lg:pl-10 mt-5 lg:mt-0">
        <h1
          class="text-5xl font-medium text-left w-full mx-auto lg:mx-0 md:w-[500px]"
        >{$t("dm.header")}</h1>
        <p>Welcome to the DM homepage!</p>

        <p>The following people have sent messages to you:</p>
        <ul>
            {#each messageSenders as sender}
                <li>{sender.name} (<span class={sender.valid ? "" : "invalid"}>{sender.nip05}</span>{#if sender.valid} &#x2713;{/if})</li>
            {/each}
        </ul>

        <p>The following people have received messages from you:</p>
        <ul>
            {#each messageRecipients as recipient}
                <li>{recipient.name} (<span class={recipient.valid ? "" : "invalid"}>{recipient.nip05}</span>{#if recipient.valid} &#x2713;{/if})</li>
            {/each}
        </ul>
    </div>
</div>
