<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { isValid } from "nostr-tools/nip05";
  import { decode } from "nostr-tools/nip19";

  import { getNostrUserInfo } from "$lib/nip01";
  import {
    getMessageRumours, subscribeToMessages, cacheRumour,
    getCachedChatList, setCachedChatList,
    getCachedUserInfo, setCachedUserInfo,
  } from "$lib/messaging";
  import { pTagKeys } from "$lib/nostr";
  import { t } from "$lib/translations";

  let { data } = $props();
  const user = $derived(data.user);

  (() => {
    if (!data.user) {
      window.location.replace("/login");
    }
  })();

  const coinosUserFromPubkey = async (pubkey: string): Promise<any> => {
    const response = await fetch(`/api/users/${pubkey}`);
    if (response.ok) {
      const info = await response.json();
      return info.anon ? null : info;
    }
    return null;
  };

  const userInfo = async (pubkey: string) => {
    if (pubkey.slice(0, 4) === "npub") {
      return userInfo(decode(pubkey).data as string);
    }

    const cached = getCachedUserInfo(pubkey);
    if (cached) return cached;

    const nostrUserInfo = (await getNostrUserInfo(pubkey)) || {};
    const valid = "nip05" in nostrUserInfo && (await isValid(pubkey, nostrUserInfo.nip05));
    const coinosUser = await coinosUserFromPubkey(pubkey);
    const info = {
      coinosUsername: coinosUser?.username || null,
      picture: coinosUser?.picture || nostrUserInfo?.picture || null,
      nostrName: nostrUserInfo?.name,
      nip05: nostrUserInfo?.nip05,
      nip05Valid: valid,
      pubkey,
    };
    setCachedUserInfo(pubkey, info);
    return info;
  };

  const name = (info: any): string => {
    return info.coinosUsername || info.nostrName || $t("dm.anonymous");
  };

  const rumourInvolves = (rumour: any, pubkey: string) => {
    if (rumour.pubkey === pubkey) return true;
    for (const tagPK of pTagKeys(rumour)) {
      if (tagPK === pubkey) return true;
    }
    return false;
  };

  const mostRecentCommunication = (rumours: any[], pubkey: string) => {
    let mostRecentTime = null;
    for (const rumour of rumours.filter((r) => rumourInvolves(r, pubkey))) {
      if (!mostRecentTime || rumour.created_at > mostRecentTime) {
        mostRecentTime = rumour.created_at;
      }
    }
    return mostRecentTime;
  };

  const lastMessage = (rumours: any[], pubkey: string) => {
    let latest: any = null;
    for (const rumour of rumours.filter((r) => rumourInvolves(r, pubkey))) {
      if (!latest || rumour.created_at > latest.created_at) {
        latest = rumour;
      }
    }
    return latest?.content || "";
  };

  // Restore from localStorage on hard refresh, or in-memory cache on SPA nav
  // svelte-ignore state_referenced_locally
  const userPubkey = data.user?.pubkey;
  const storageKey = `chatList:${userPubkey}`;
  const cachedList = getCachedChatList(userPubkey);
  let stored: any = null;
  try { stored = JSON.parse(localStorage.getItem(storageKey) || "null"); } catch {}
  let chats: any[] = $state(cachedList?.chats ?? stored?.chats ?? []);
  let allRumours: any[] = $state(cachedList?.rumours ?? stored?.rumours ?? []);
  // svelte-ignore state_referenced_locally
  let loaded = $state(chats.length > 0);

  const updateSendersRecipients = async (rumours: any[]) => {
    allRumours = rumours;
    const senders = new Set<any>();
    const recipients = new Set<any>();
    for (const rumour of rumours) {
      if (rumour.pubkey !== user.pubkey) {
        senders.add(await userInfo(rumour.pubkey));
      } else {
        for (const pubkey of pTagKeys(rumour)) {
          recipients.add(await userInfo(pubkey));
        }
      }
    }

    const chatMap = new Map<string, any>();
    for (const sender of senders) chatMap.set(sender.pubkey, sender);
    for (const recipient of recipients) chatMap.set(recipient.pubkey, recipient);
    chats = Array.from(chatMap.values());
    chats.sort(
      (a, b) =>
        (mostRecentCommunication(rumours, b.pubkey) ?? 0) -
        (mostRecentCommunication(rumours, a.pubkey) ?? 0),
    );
    setCachedChatList(user.pubkey, chats, allRumours);
    try { localStorage.setItem(storageKey, JSON.stringify({ chats, rumours })); } catch {}
  };

  (() => getMessageRumours(data.user).then(updateSendersRecipients).then(() => (loaded = true)))();

  let closeSub: (() => void) | undefined;

  onMount(() => {
    subscribeToMessages(user, async (rumour) => {
      if (!allRumours.find((r) => r.id === rumour.id)) {
        cacheRumour(user.pubkey, rumour);
        allRumours = [...allRumours, rumour];
        await updateSendersRecipients(allRumours);
      }
    }).then((close) => (closeSub = close));
  });

  onDestroy(() => closeSub?.());
</script>

<div class="container mx-auto max-w-xl px-4 space-y-4">
  {#if !loaded}
    <div class="flex justify-center py-8"><div class="loading loading-spinner"></div></div>
  {:else if chats.length === 0}
    <p class="text-center text-secondary">{$t("dm.noChats")}</p>
  {:else}
    {#each chats as c}
      <a href="/messages/{c.pubkey}" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-base-200">
        {#if c.picture}
          <img src={c.picture} alt={name(c)} class="w-12 h-12 rounded-full object-cover shrink-0" />
        {:else}
          <div class="w-12 h-12 rounded-full bg-base-300 shrink-0"></div>
        {/if}
        <div class="min-w-0">
          <div class="font-semibold text-lg">{name(c)}</div>
          <div class="text-secondary text-sm truncate">{lastMessage(allRumours, c.pubkey)}</div>
        </div>
      </a>
    {/each}
  {/if}
</div>
