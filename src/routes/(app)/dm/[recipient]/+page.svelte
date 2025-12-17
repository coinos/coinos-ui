<script lang="ts">
 import { tick } from "svelte";
 import Icon from "$comp/Icon.svelte";

 import { hexToBytes, bytesToHex } from '@noble/hashes/utils';
 import { SimplePool } from 'nostr-tools/pool';
 import { isValid } from "nostr-tools/nip05";
 import * as toolsnip17 from 'nostr-tools/nip17';

 import { getNostrUserInfo } from '$lib/nip01';
 import { relaysSupporting } from '$lib/nip11';
 import * as libnip17 from '$lib/nip17';
 import { sign, getPrivateKey } from '$lib/nostr';
 import { t } from "$lib/translations";
 import { theme } from "$lib/store";

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
 let nostrUserInfo = $state({});

 const userInfo = async (pubkey: string) => {
   const nostrUserInfo = await getNostrUserInfo(pubkey);
   const valid = await isValid(pubkey, nostrUserInfo.nip05);
   return { name: nostrUserInfo.name, nip05: nostrUserInfo.nip05, valid };
 }
 userInfo(recipient.pubkey).then(info => nostrUserInfo = info);

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

 const TIME = new Intl.DateTimeFormat(
   undefined, { hour: "numeric", hour12: false, minute: "numeric" });
 const NEAR_DATE = new Intl.DateTimeFormat(
   undefined, { month: "short", day: "numeric", weekday: "short" });
 const FAR_DATE = new Intl.DateTimeFormat(
   undefined, { year: "numeric", month: "short", day: "numeric", weekday: "short" });
 const NEAR_DISTANCE = 182 * 24 * 60 * 60 * 1000; // around 6 months
 const formatDate = (date: Date): string => {
   if (date.getTime() >= Date.now() - NEAR_DISTANCE) {
     return NEAR_DATE.format(date);
   } else {
     return FAR_DATE.format(date);
   }
 }

 const expirationClose = (expiration: number) => {
   return expiration <= (Date.now() / 1000 + 2 * 86400);
 }

 const sendMessage = async (message: string) => {
   const expiry = expiryEnabled ? expiryDays : null;
   await libnip17.send(message, user, recipient, expiry);
   loadEvents();
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

 .secondary {
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
     height: 1.5em;
 }

 .tiny {
     width: 2em;
 }

 .invalid {
     text-decoration-line: line-through;
 }

 .date-header {
     text-align: center;
     margin: 1.5em 0em;
 }

 .timestamp {
     margin-left: 0.5em;
     text-align: right;
 }

 .message {
     padding: 0.25em 0.75em;
     width: fit-content;
     max-width: 75%;
     border-radius: 10px;
 }

 .light-message {
     background-color: #DDD;
 }

 .dark-message {
     background-color: #222;
 }

 .by-user {
     margin: 3px 0px 3px auto;
 }

 .by-other {
     margin: 3px auto 3px 0px;
 }

 .vcenter {
     margin: auto 0px;
 }
</style>

<div class="container">
    <div class="space-y-2 mx-auto space-y-5 lg:max-w-xl xl:max-w-2xl lg:pl-10 mt-5 lg:mt-0">
        <h1><a class="text-3xl" href="/{recipient.username}">{recipient.username || nostrUserInfo.name}</a>
            {#if nostrUserInfo.nip05}
                <span class={"secondary timestamp text-small" + (nostrUserInfo.valid ? "" : " invalid")} title="Pubkey: {recipient.pubkey}">{nostrUserInfo.nip05}</span>
            {/if}
        </h1>

        <div id="messages" style="overflow-y: scroll; max-height: 600px;">
            {#each dates as day}
                <p class="date-header secondary">{formatDate(new Date(day * 86400 * 1000))}</p>
            <ul>
                {#each messageRumours.get(day) as rumour}
                    {#if rumour.pubkey === user.pubkey}
                        <li class={(rumour.expiration && expirationClose(rumour.expiration) ? "secondary " : "") + ($theme === "light" ? "light-message " : "dark-message ") + "message by-user"}>{rumour.content} <span class="timestamp secondary text-xs">{TIME.format(new Date(rumour.created_at * 1000))}</span></li>
                    {:else if rumour.pubkey === recipient.pubkey}
                        <li class={(rumour.expiration && expirationClose(rumour.expiration) ? "secondary " : "") + ($theme === "light" ? "light-message " : "dark-message ") + "message by-other"}>{rumour.content} <span class="timestamp secondary text-xs">{TIME.format(new Date(rumour.created_at * 1000))}</span></li>
                    {/if}
                {/each}
            </ul>
        {/each}
        </div>

        <textarea id="message-contents" bind:value={text}></textarea>
        <input id="send-message" type="button" class="btn btn-accent" disabled={!canSend} value={canSend ? $t("dm.sendMessage") : $t("dm.relaysNotFound").replace("[R]", recipient.username)} on:click={async () => sendMessage(text)}>
        {#if relayWarningShown}
            <p class="warning"><em>{$t("dm.noRelaysSet")} <a class="link" href="/settings/nostr#dm-relays">{$t("dm.nostrSettingsLink")}</a></em></p>
        {/if}

        <input type="checkbox" id="expiryCheckbox" class="tiny" bind:checked={expiryEnabled} disabled={!canSendExpiring}>
        <label for="expiryCheckbox">{$t("dm.expiry")}</label>: <input type="number" class="short vcenter" bind:value={expiryDays} disabled={!expiryEnabled} min="1" step="1" max="99999"> <label for="expiryCheckbox">{$t("dm.days")}</label>.
        <p class="secondary">{$t("dm.fadedWarning")}</p>
        {#if canSend && !canSendExpiring}
            <p class="warning"><em>{$t("dm.cantSendExpiring").replace("[R]", recipient.username)}</em></p>
        {/if}
    </div>
</div>
