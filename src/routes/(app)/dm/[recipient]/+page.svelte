<script lang="ts">
 import { tick } from "svelte";
 import Icon from "$comp/Icon.svelte";
 import { hexToBytes, bytesToHex } from '@noble/hashes/utils';
 import * as toolsnip17 from 'nostr-tools/nip17';
 import { SimplePool } from 'nostr-tools/pool';
 import { relaysSupporting } from '$lib/nip11';
 import * as libnip17 from '$lib/nip17';
 import { sign, getPrivateKey } from '$lib/nostr';
 import { t } from "$lib/translations";

 let { data } = $props();
 const { user, recipient } = data;

 const pool = new SimplePool();

 let text = $state("");
 let messageRumours = $state([]);
 let dates = $state([]);
 let relayWarningShown = $state(false);
 let expiryEnabled = $state(false);
 let expiryDays = $state(7);
 let canSend = $state(false);
 let canSendExpiring = $state(false);

 const appendMultimap = (map: Map, key: string, value: object) => {
   if (map.has(key)) {
     map.get(key).push(value);
   } else {
     map.set(key, [value]);
   }
 }

 const dateMap = (events: object[]): Map<number, object> => {
   let eventsMap = new Map();
   for (const event of events) {
     const created = Math.floor(event.created_at / 86400);
     appendMultimap(eventsMap, created, event);
   }
   for (const [date, dateEvents] of eventsMap) {
     dateEvents.sort((ev1, ev2) => ev1.created_at - ev2.created_at);
   }
   return eventsMap;
 }

 const loadEvents = async () => {
   const rumours = await libnip17.getMessageRumours(user);
   messageRumours = dateMap(rumours);

   dates = Array.from(messageRumours.keys());
   dates.sort((d1, d2) => d1 - d2);

   await tick();
   const messages = document.getElementById("messages");
   messages.scrollTop = messages.scrollHeight;
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

 const expirationClose = (expiration: number) => {
   return expiration <= (Date.now() / 1000 + 2 * 86400);
 }

 const sendMessage = async (message: string) => {
   const expiry = expiryEnabled ? expiryDays : null;
   await libnip17.send(message, user, recipient, expiry);
   loadEvents();
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

 libnip17.getPreferredRelays(user.pubkey).then((relays) => {
   if (!relays || relays.length == 0) {
     relayWarningShown = true;
     return;
   }
   relayWarningShown = false;
   loadEvents();
 });

 libnip17.getPreferredRelays(recipient.pubkey).then((relays) => {
   canSend = relays && relays.length > 0;
   relaysSupporting(relays, [40])
     .then((supporting) => canSendExpiring = supporting.length > 0);
 });
</script>

<style>
 .warning {
     color: #ff7f00;
 }

 .expiring {
     color: #7f7f7f;
 }

 .link {
     text-decoration-line: underline;
 }

 .inline {
     white-space: nowrap;
 }

 .short {
     width: 6em;
     height: 2em;
 }

 .tiny {
     width: 2em;
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
        >{$t("dm.header")}</h1>
        <p>{$t("dm.recipientMsg").replace("[R]", recipient.username)}</p>

        <div id="messages" style="overflow-y: scroll; max-height: 400px;">
        {#each dates as day}
            <p>[{new Date(day * 86400 * 1000).toDateString()}]</p>
            <ul>
                {#each messageRumours.get(day) as rumour}
                    {#if rumour.pubkey === recipient.pubkey || rumour.pubkey === user.pubkey}
                        <li class={rumour.expiration && expirationClose(rumour.expiration) ? "expiring" : ""}>{timeString(new Date(rumour.created_at * 1000))} {dmName(rumour.pubkey)}: {rumour.content}</li>
                    {/if}
                {/each}
            </ul>
        {/each}
        </div>

        <textarea id="message-contents" bind:value={text}></textarea>

        <input type="checkbox" id="expiryCheckbox" class="tiny" bind:checked={expiryEnabled} disabled={!canSendExpiring}>
        <label for="expiryCheckbox">{$t("dm.expiry")}</label>: <input type="number" class="short" bind:value={expiryDays} disabled={!expiryEnabled} min="1" step="1" max="99999"> <label for="expiryCheckbox">{$t("dm.days")}</label>.
        <p class="expiring">{$t("dm.fadedWarning")}</p>
        {#if canSend && !canSendExpiring}
            <p class="warning"><em>{$t("dm.cantSendExpiring").replace("[R]", recipient.username)}</em></p>
        {/if}

        <input id="send-message" type="button" class="btn" disabled={!canSend} value={canSend ? $t("dm.sendMessage") : $t("dm.relaysNotFound").replace("[R]", recipient.username)} on:click={async () => sendMessage(text)}>
        {#if relayWarningShown}
            <p class="warning"><em>{$t("dm.noRelaysSet")} <a class="link" href="/settings/nostr#dm-relays">{$t("dm.nostrSettingsLink")}</a></em></p>
        {/if}
    </div>
</div>
