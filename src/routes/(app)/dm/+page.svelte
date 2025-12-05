<script lang="ts">
 import { t } from "$lib/translations";
 import { pTagKeys } from '$lib/nostr';
 import { getMessageRumours } from '$lib/nip17';

 let { data } = $props();
 const { user } = data;

 const updateSendersRecipients = (rumours: object[]) => {
   const senders = new Set<string>();
   const recipients = new Set<string>();
   for (const rumour of rumours) {
     if (rumour.pubkey !== user.pubkey) {
       senders.add(rumour.pubkey);
     } else {
       pTagKeys(rumour).forEach(r => recipients.add(r));
     }
   }
   messageSenders = Array.from(senders);
   messageRecipients = Array.from(recipients);
 };

 let messageSenders = $state([]);
 let messageRecipients = $state([]);
 getMessageRumours(user).then(updateSendersRecipients);
</script>

<div class="container">
    <div class="space-y-2 mx-auto space-y-5 lg:max-w-xl xl:max-w-2xl lg:pl-10 mt-5 lg:mt-0">
        <h1
          class="text-5xl font-medium text-left w-full mx-auto lg:mx-0 md:w-[500px]"
        >{$t("dm.header")}</h1>
        <p>Welcome to the DM homepage!</p>

        <p>The following people have sent messages to you:</p>
        <ul>
            {#each messageSenders as sender}
                <li>{sender}</li>
            {/each}
        </ul>

        <p>The following people have received messages from you:</p>
        <ul>
            {#each messageRecipients as recipient}
                <li>{recipient}</li>
            {/each}
        </ul>
    </div>
</div>
