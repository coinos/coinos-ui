<script lang="ts">
  import { tick, onMount, onDestroy } from "svelte";
  import { page } from "$app/state";
  import { decode } from "nostr-tools/nip19";
  import { isValid } from "nostr-tools/nip05";

  import { getNostrUserInfo } from "$lib/nip01";
  import * as libnip17 from "$lib/nip17";
  import { pTagKeys } from "$lib/nostr";
  import { t } from "$lib/translations";
  import { theme } from "$lib/store";

  const focus = (el: HTMLElement) => el.focus();

  const scrollChat = () => {
    const doScroll = () => {
      const el = document.getElementById("messages");
      if (el) el.scrollTop = el.scrollHeight;
      document.getElementById("messages-end")?.scrollIntoView({ block: "nearest" });
    };
    doScroll();
    setTimeout(doScroll, 200);
  };

  let { data } = $props();
  const user = $derived(data.user);
  const pubkey: string = $derived(page.params.pubkey!);

  (() => {
    if (!data.user) {
      window.location.replace("/login");
    }
  })();

  const coinosUserFromPubkey = async (pk: string): Promise<any> => {
    const response = await fetch(`/api/users/${pk}`);
    if (response.ok) {
      const info = await response.json();
      return info.anon ? null : info;
    }
    return null;
  };

  const userInfo = async (pk: string) => {
    if (pk.slice(0, 4) === "npub") {
      return userInfo(decode(pk).data as string);
    }

    const cached = libnip17.getCachedUserInfo(pk);
    if (cached) return cached;

    const nostrUserInfo = (await getNostrUserInfo(pk)) || {};
    const valid = "nip05" in nostrUserInfo && (await isValid(pk, nostrUserInfo.nip05));
    const coinosUser = await coinosUserFromPubkey(pk);
    const info = {
      coinosUsername: coinosUser?.username || null,
      picture: coinosUser?.picture || nostrUserInfo?.picture || null,
      nostrName: nostrUserInfo?.name,
      nip05: nostrUserInfo?.nip05,
      nip05Valid: valid,
      pubkey: pk,
    };
    libnip17.setCachedUserInfo(pk, info);
    return info;
  };

  const name = (info: any): string => {
    return info.coinosUsername || info.nostrName || $t("dm.anonymous");
  };

  let selectedChat: any = $state(libnip17.getCachedUserInfo(pubkey) ?? { pubkey });
  let text = $state("");
  let allRumours: any[] = $state([]);
  let messageRumours: Map<number, any[]> = $state(new Map());
  let dates: number[] = $state([]);
  let relayWarningShown = $state(false);
  let canSend = $state(false);
  let sendError = $state("");

  const appendMultimap = (map: Map<any, any>, key: any, value: any) => {
    if (map.has(key)) {
      map.get(key)!.push(value);
    } else {
      map.set(key, [value]);
    }
  };

  const dateMap = (events: any[]): Map<number, any[]> => {
    let eventsMap = new Map<number, any[]>();
    for (const event of events) {
      const created = Math.floor(event.created_at / 86400);
      appendMultimap(eventsMap, created, event);
    }
    for (const [date, dateEvents] of eventsMap) {
      dateEvents.sort((ev1: any, ev2: any) => ev1.created_at - ev2.created_at);
    }
    return eventsMap;
  };

  const updateEvents = async () => {
    allRumours = await libnip17.getMessageRumours(user);
    const rumours = allRumours.filter(
      (r) =>
        (r.pubkey === user.pubkey && pTagKeys(r).includes(pubkey)) ||
        (r.pubkey === pubkey && pTagKeys(r).includes(user.pubkey)),
    );
    messageRumours = dateMap(rumours);

    dates = Array.from(messageRumours.keys());
    dates.sort((d1, d2) => d1 - d2);

    await tick();
    scrollChat();
  };

  const TIME = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    hour12: false,
    minute: "numeric",
  });
  const NEAR_DATE = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
  const FAR_DATE = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });
  const NEAR_DISTANCE = 182 * 24 * 60 * 60 * 1000;
  const formatDate = (date: Date): string => {
    if (date.getTime() >= Date.now() - NEAR_DISTANCE) {
      return NEAR_DATE.format(date);
    } else {
      return FAR_DATE.format(date);
    }
  };

  const sendMessage = async (message: string) => {
    sendError = "";
    try {
      await libnip17.send(message, user, selectedChat);
      text = "";
      updateEvents();
      await tick();
      document.getElementById("message-contents")?.focus();
    } catch (e: any) {
      console.error("Failed to send message:", e);
      sendError = $t("dm.sendFailed");
    }
  };

  updateEvents();

  onMount(() => {
    userInfo(pubkey).then((info) => (selectedChat = info));
    libnip17.getPreferredRelays(pubkey).then((relays) => {
      canSend = relays && relays.length > 0;
    });
  });

  (() => libnip17.getPreferredRelays(data.user.pubkey).then((relays) => {
    if (!relays || relays.length == 0) {
      relayWarningShown = true;
      return;
    }
    relayWarningShown = false;
  }))();

  let closeSub: (() => void) | undefined;

  onMount(() => {
    libnip17.subscribeToMessages(user, async (rumour) => {
      if (!allRumours.find((r) => r.id === rumour.id)) {
        libnip17.cacheRumour(user.pubkey, rumour);
        allRumours = [...allRumours, rumour];
      }

      if (
        (rumour.pubkey === user.pubkey && pTagKeys(rumour).includes(pubkey)) ||
        (rumour.pubkey === pubkey && pTagKeys(rumour).includes(user.pubkey))
      ) {
        const dayKey = Math.floor(rumour.created_at / 86400);
        if (messageRumours.has(dayKey)) {
          const dayMsgs = messageRumours.get(dayKey)!;
          if (!dayMsgs.find((r: any) => r.id === rumour.id)) {
            dayMsgs.push(rumour);
            dayMsgs.sort((a: any, b: any) => a.created_at - b.created_at);
          }
        } else {
          messageRumours.set(dayKey, [rumour]);
        }
        dates = Array.from(messageRumours.keys()).sort((a: number, b: number) => a - b);
        messageRumours = new Map(messageRumours);

        await tick();
        scrollChat();
      }
    }).then((close) => (closeSub = close));
  });

  onDestroy(() => closeSub?.());
</script>

<div class="container mx-auto max-w-xl px-4 space-y-2">
  {#if selectedChat}
    {@const chatProfile = selectedChat.coinosUsername ? `/${selectedChat.coinosUsername}` : null}
    <a href={chatProfile} class="flex items-center gap-3 mb-2 hover:opacity-80">
      {#if selectedChat.picture}
        <img src={selectedChat.picture} alt={name(selectedChat)} class="w-10 h-10 rounded-full object-cover" />
      {/if}
      <h2 class="text-xl font-semibold">{name(selectedChat)}</h2>
    </a>

    <div id="messages">
      {#each dates as day}
        <p class="date-header secondary">{formatDate(new Date(day * 86400 * 1000))}</p>
        <ul>
          {#each messageRumours.get(day) ?? [] as rumour, i}
            {@const dayMessages = messageRumours.get(day) ?? []}
            {@const next = dayMessages[i + 1]}
            {@const isLastInRun = !next || next.pubkey !== rumour.pubkey}
            {#if rumour.pubkey === user.pubkey && pTagKeys(rumour).includes(selectedChat.pubkey)}
              <li class="message-row by-user">
                <div
                  class={($theme === "light" ? "light-message " : "dark-message ") + "message"}
                >
                  {rumour.content}
                  <span class="timestamp secondary text-xs">
                    {TIME.format(new Date(rumour.created_at * 1000))}
                  </span>
                </div>
                {#if isLastInRun && user.picture}
                  <a href="/{user.username}"><img src={user.picture} alt={user.username} class="msg-avatar" /></a>
                {:else}
                  <div class="msg-avatar-placeholder"></div>
                {/if}
              </li>
            {:else if rumour.pubkey === selectedChat.pubkey && pTagKeys(rumour).includes(user.pubkey)}
              <li class="message-row by-other">
                {#if isLastInRun && selectedChat.picture}
                  <a href={chatProfile}><img src={selectedChat.picture} alt={name(selectedChat)} class="msg-avatar" /></a>
                {:else}
                  <div class="msg-avatar-placeholder"></div>
                {/if}
                <div
                  class={($theme === "light" ? "light-message " : "dark-message ") + "message"}
                >
                  {rumour.content}
                  <span class="timestamp secondary text-xs">
                    {TIME.format(new Date(rumour.created_at * 1000))}
                  </span>
                </div>
              </li>
            {/if}
          {/each}
        </ul>
      {/each}
      <div id="messages-end"></div>
    </div>

    <div class="input-bar">
      <textarea
        id="message-contents"
        bind:value={text}
        use:focus
        onkeydown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (canSend && text.trim()) sendMessage(text);
          }
        }}
      ></textarea>
      <input
        id="send-message"
        type="button"
        class="btn btn-accent"
        disabled={!canSend}
        value={canSend
        ? $t("dm.sendMessage")
        : $t("dm.relaysNotFound").replace("[R]", selectedChat ? name(selectedChat) : "")}
        onclick={async () => sendMessage(text)}
      />
      {#if sendError}
        <p class="warning"><em>{sendError}</em></p>
      {/if}
    </div>
  {/if}

  {#if relayWarningShown}
    <p class="warning">
      <em>
        {$t("dm.noRelaysSet")}
        <a class="link" href="/settings/nostr#dm-relays">{$t("dm.nostrSettingsLink")}</a>
      </em>
    </p>
  {/if}
</div>

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

  .message-row {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    margin: 3px 0;
  }

  .message-row.by-user {
    justify-content: flex-end;
  }

  .message-row.by-other {
    justify-content: flex-start;
  }

  .msg-avatar {
    width: 28px;
    height: 28px;
    border-radius: 9999px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .msg-avatar-placeholder {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .date-header {
    text-align: center;
    margin: 1.5em 0em;
  }

  .timestamp {
    margin-left: 0.5em;
    text-align: right;
  }

  #messages {
    overflow-y: auto;
    max-height: 50vh;
    scrollbar-width: thin;
  }

  #messages::-webkit-scrollbar {
    width: 6px;
  }

  #messages::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.3);
    border-radius: 3px;
  }

  #messages::-webkit-scrollbar-button {
    display: none;
  }

  .message {
    padding: 0.25em 0.75em;
    width: fit-content;
    max-width: 75%;
    border-radius: 10px;
  }

  .light-message {
    background-color: #ddd;
  }

  .dark-message {
    background-color: #222;
  }

  .input-bar {
    padding: 0.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
