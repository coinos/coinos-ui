<script lang="ts">
 import { tick, onMount } from "svelte";
 import Icon from "$comp/Icon.svelte";

 import { isValid, queryProfile } from "nostr-tools/nip05";
 import * as toolsnip17 from 'nostr-tools/nip17';

 import { getNostrUserInfo } from '$lib/nip01';
 import { relaysSupporting } from '$lib/nip11';
 import { getMessageRumours } from '$lib/nip17';
 import * as libnip17 from '$lib/nip17';
 import { npubEncode, decode } from 'nostr-tools/nip19';
 import { mute, unmute, mutedAccounts } from '$lib/nip51';
 import { sign, getPrivateKey, pTagKeys } from '$lib/nostr';
 import { t } from "$lib/translations";
 import { theme } from "$lib/store";

 let { data } = $props();
 const { user } = data;

 /// chat selection
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
   if (pubkey.slice(0, 4) === "npub") {
     return userInfo(decode(pubkey).data);
   }

   const nostrUserInfo = await getNostrUserInfo(pubkey) || {};
   const valid = 'nip05' in nostrUserInfo && await isValid(pubkey, nostrUserInfo.nip05);
   const username = await usernameFromPubkey(pubkey);
   return {
     coinosUsername: username,
     nostrName: nostrUserInfo?.name,
     nip05: nostrUserInfo?.nip05,
     nip05Valid: valid, pubkey };
 }

 const name = (userInfo: object): string => {
   return userInfo.coinosUsername || userInfo.nostrName || $t("dm.anonymous");
 }

 const id = (userInfo: object): string => {
   if (userInfo.nip05 && userInfo.nip05.slice(0, 2) == "_@") {
     return userInfo.nip05.slice(2);
   }

   return userInfo.nip05 || (npubEncode(userInfo.pubkey).slice(0, 16) + "...");
 }

 const idValid = (userInfo: object): string => {
   return !userInfo.nip05 || userInfo.nip05Valid;
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
 getMessageRumours(user).then(updateSendersRecipients);

 let selectedChat = $state(null);
 let creatingNewChat = $state(false);
 let searchQuery = $state("");

 /// individual chat
 let text = $state("");
 let allRumours = $state([]);
 let messageRumours = $state([]);
 let dates = $state([]);
 let relayWarningShown = $state(false);
 let expiryEnabled = $state(false);
 let expiryDays = $state(7);
 let canSend = $state(false);
 let canSendExpiring = $state(false);
 let nostrUserInfo = $state({});

 const includesPubkey = (chats: object[], pubkey: string) => {
   for (const c of chats) {
     if (c.pubkey === pubkey) {
       return true;
     }
   }
   return false;
 }

 const selectChat = (c: object) => {
   selectedChat = c;
   if (!includesPubkey(chats, c.pubkey)) {
     chats.unshift(c);
   }
   userInfo(selectedChat.pubkey).then(info => nostrUserInfo = info);
   libnip17.getPreferredRelays(selectedChat.pubkey).then((relays) => {
     canSend = relays && relays.length > 0;
     relaysSupporting(relays, [40])
       .then((supporting) => canSendExpiring = supporting.length > 0);
   });
   updateEvents();
 }

 const selectChatUsername = async (username: string) => {
   const response = await fetch(`/api/users/${username}`);
   if (!response.ok) {
     alert("Invalid username");
     return;
   }
   const coinosUserInfo = await response.json();
   selectChatPubkey(coinosUserInfo.pubkey);
 }

 const selectChatNip05 = async (nip05: string) => {
   const response = await queryProfile(nip05);
   if (response == null) {
     alert("Invalid nip-05");
     return;
   }
   selectChatPubkey(response.pubkey);
 }

 const selectChatPubkey = async (pubkey: string) => {
   selectChat(await userInfo(pubkey));
   creatingNewChat = false;
 }

 onMount(() => {
   const urlParams = new URLSearchParams(window.location.search);
   if (urlParams.get('username')) {
     selectChatUsername(urlParams.get('username'));
   } else if (urlParams.get('nip05')) {
     selectChatNip05(urlParams.get('nip05'));
   } else if (urlParams.get('pubkey')) {
     selectChatPubkey(urlParams.get('pubkey'));
   }
 });

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

 const updateEvents = async () => {
   allRumours = await libnip17.getMessageRumours(user);
   const rumours = allRumours.filter((r) =>
     (r.pubkey === user.pubkey && pTagKeys(r).includes(selectedChat.pubkey)) ||
     (r.pubkey === selectedChat.pubkey && pTagKeys(r).includes(user.pubkey)));
   messageRumours = dateMap(rumours);

   dates = Array.from(messageRumours.keys());
   dates.sort((d1, d2) => d1 - d2);

   await tick();
   const messages = document.getElementById("messages");
   if (messages) {
     messages.scrollTop = messages.scrollHeight;
   }
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
   await libnip17.send(message, user, selectedChat, expiry);
   updateEvents();
 }

 libnip17.getPreferredRelays(user.pubkey).then((relays) => {
   if (!relays || relays.length == 0) {
     relayWarningShown = true;
     return;
   }
   relayWarningShown = false;
 });

 let muted = $state(new Set<string>());
 mutedAccounts(user).then((m) => muted = m);

 const toggleMute = async (pubkey: string) => {
   if (muted && muted.has(pubkey)) {
     await unmute(user, pubkey);
   } else {
     await mute(user, pubkey, true);
   }
   muted = await mutedAccounts(user);
 }
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
     height: 1.5em;
     margin-bottom: 10px;
 }

 .small-width {
     width: 6em;
 }

 .tiny {
     width: 2em;
 }

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
     margin: 2px 0px;
     padding: 0 25px;
     border-radius: 10px;
     min-width: 30px;
     text-align: left;
 }

 .tall-btn {
     min-height: 3em;
     width: 100%;
 }

 .small-btn {
     padding: 0 15px;
     border-radius: 5px;
     text-align: left;
 }

 .push-right {
     margin-left: auto;
 }

 .chat-header {
     margin: 1em 15px 0.5em;
 }

 .light-chat-btn {
     background-color: #eeeeee;
 }

 .dark-chat-btn {
     background-color: #222222;
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

<div class="super-container">
    <div class={"sidebar " + ($theme === "light" ? "light-sidebar" : "dark-sidebar")}>
        <h2 class="text-xl chat-header">
            {creatingNewChat ? $t("dm.newChatHeader") : $t("dm.chatHeader")}
            <button class={"chat-btn push-right " + ($theme === "light" ? "light-chat-btn" : "dark-chat-btn") + (creatingNewChat ? ($theme === "light" ? " light-selected" : " dark-selected") : "")} on:click={() =>  {creatingNewChat = !creatingNewChat; selectedChat = null}}>+</button>
        </h2>
        {#if creatingNewChat}
            <input type="text" class="short" bind:value={searchQuery} placeholder="{$t("dm.searchPrompt")}">
        {/if}
        {#if !creatingNewChat}
            {#each chats as c}
                {#if (selectedChat && selectedChat.pubkey === c.pubkey) || !(muted && muted.has(c.pubkey))}
                    <button class={"chat-btn tall-btn " + ($theme === "light" ? "light-chat-btn" : "dark-chat-btn") + (selectedChat && selectedChat.pubkey == c.pubkey ? ($theme === "light" ? " light-selected" : " dark-selected") : "")} on:click={() => selectChat(c)}>
                        <span class="{"text-xl" + (muted && muted.has(c.pubkey) ? " secondary" : "")}">{name(c)}</span> <span class={(idValid(c) ? "" : "invalid ") + "secondary text-xs"}>{id(c)}</span>
                    </button>
                {/if}
            {/each}
        {:else if searchQuery !== ""}
            <button class={"chat-btn tall-btn " + ($theme === "light" ? "light-chat-btn" : "dark-chat-btn")} on:click={() => selectChatUsername(searchQuery)}>
                <span class="text-xl">{$t("dm.findByUsername")}</span>
            </button>
            {#if searchQuery.includes(".")}
                <button class={"chat-btn tall-btn " + ($theme === "light" ? "light-chat-btn" : "dark-chat-btn")} on:click={() => selectChatNip05(searchQuery)}>
                    <span class="text-xl">{$t("dm.findByNIP05")}</span>
                </button>
            {/if}
            {#if searchQuery.length === 64 || searchQuery.slice(0, 4) === "npub"}
                <button class={"chat-btn tall-btn " + ($theme === "light" ? "light-chat-btn" : "dark-chat-btn")} on:click={() => selectChatPubkey(searchQuery)}>
                    <span class="text-xl">{$t("dm.findByPubkey")}</span>
                </button>
            {/if}
        {/if}
    </div>
    <div class="main container space-y-2 mx-auto space-y-5 lg:max-w-xl xl:max-w-2xl lg:pl-10 mt-5 lg:mt-0">
        <h1
          class="text-5xl font-medium text-left w-full mx-auto lg:mx-0 md:w-[500px]"
        >{$t("dm.header")}</h1>

        {#if selectedChat}
            <h1>
                {#if selectedChat.coinosUsername}
                    <a class="text-3xl" href="/{selectedChat.coinosUsername}">{name(selectedChat)}</a>
                {:else}
                    <span class="text-3xl">{name(selectedChat)}</span>
                {/if}
                <span class={"secondary timestamp text-small" + (idValid(selectedChat) ? "" : " invalid")} title="{npubEncode(selectedChat.pubkey)}">{id(selectedChat)}</span>
                <button class={"small-btn push-right " + ($theme === "light" ? "light-chat-btn" : "dark-chat-btn")} on:click={() => toggleMute(selectedChat.pubkey)}>{$t(muted && muted.has(selectedChat.pubkey) ? "dm.unmute" : "dm.mute")}</button>
            </h1>

            {#if !(muted && muted.has(selectedChat.pubkey))}
                <div id="messages" style="overflow-y: scroll; max-height: 600px;">
                    {#each dates as day}
                        <p class="date-header secondary">{formatDate(new Date(day * 86400 * 1000))}</p>
                        <ul>
                            {#each messageRumours.get(day) as rumour}
                                {#if rumour.pubkey === user.pubkey && pTagKeys(rumour).includes(selectedChat.pubkey)}
                                    <li class={(rumour.expiration && expirationClose(rumour.expiration) ? "secondary " : "") + ($theme === "light" ? "light-message " : "dark-message ") + "message by-user"}>{rumour.content} <span class="timestamp secondary text-xs">{TIME.format(new Date(rumour.created_at * 1000))}</span></li>
                                {:else if rumour.pubkey === selectedChat.pubkey && pTagKeys(rumour).includes(user.pubkey)}
                                    <li class={(rumour.expiration && expirationClose(rumour.expiration) ? "secondary " : "") + ($theme === "light" ? "light-message " : "dark-message ") + "message by-other"}>{rumour.content} <span class="timestamp secondary text-xs">{TIME.format(new Date(rumour.created_at * 1000))}</span></li>
                                {/if}
                            {/each}
                        </ul>
                    {/each}
                </div>

                <textarea id="message-contents" bind:value={text}></textarea>
                <input id="send-message" type="button" class="btn btn-accent" disabled={!canSend} value={canSend ? $t("dm.sendMessage") : $t("dm.relaysNotFound").replace("[R]", name(selectedChat))} on:click={async () => sendMessage(text)}>
            {/if}

            {#if !(muted && muted.has(selectedChat.pubkey))}
                <input type="checkbox" id="expiryCheckbox" class="tiny" bind:checked={expiryEnabled} disabled={!canSendExpiring}>
                <label for="expiryCheckbox">{$t("dm.expiry")}</label>: <input type="number" class="short small-width vcenter" bind:value={expiryDays} disabled={!expiryEnabled} min="1" step="1" max="99999"> <label for="expiryCheckbox">{$t("dm.days")}</label>.
                <p class="secondary">{$t("dm.fadedWarning")}</p>
                {#if canSend && !canSendExpiring}
                    <p class="warning"><em>{$t("dm.cantSendExpiring").replace("[R]", name(selectedChat))}</em></p>
                {/if}
            {/if}
        {:else if chats.length == 0}
            <p>{$t("dm.noChats")}</p>
        {:else}
            <p>{$t("dm.selectChat")}</p>
        {/if}
        {#if relayWarningShown}
            <p class="warning"><em>{$t("dm.noRelaysSet")} <a class="link" href="/settings/nostr#dm-relays">{$t("dm.nostrSettingsLink")}</a></em></p>
        {/if}
    </div>
</div>
