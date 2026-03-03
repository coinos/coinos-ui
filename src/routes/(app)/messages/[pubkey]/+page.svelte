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
  import ChatMessage from "$comp/ChatMessage.svelte";

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
    text = "";
    const ta = document.getElementById("message-contents") as HTMLTextAreaElement;
    if (ta) {
      ta.style.height = "auto";
      ta.focus();
    }
    try {
      await libnip17.send(message, user, selectedChat);
      updateEvents();
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

  // Scroll messages to bottom when mobile keyboard opens/closes
  onMount(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => scrollChat();
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  });

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
        const existing = messageRumours.get(dayKey);
        if (existing) {
          if (!existing.find((r: any) => r.id === rumour.id)) {
            const updated = [...existing, rumour].sort((a: any, b: any) => a.created_at - b.created_at);
            messageRumours = new Map(messageRumours).set(dayKey, updated);
          }
        } else {
          messageRumours = new Map(messageRumours).set(dayKey, [rumour]);
        }
        dates = Array.from(messageRumours.keys()).sort((a: number, b: number) => a - b);

        await tick();
        scrollChat();
      }
    }).then((close) => (closeSub = close));
  });

  onDestroy(() => closeSub?.());
</script>

<div class="chat-container">
  {#if selectedChat}
    {@const chatProfile = selectedChat.coinosUsername ? `/${selectedChat.coinosUsername}` : null}
    <a href={chatProfile} class="chat-header">
      {#if selectedChat.picture}
        <img src={selectedChat.picture} alt={name(selectedChat)} class="w-10 h-10 rounded-full object-cover" />
      {/if}
      <h2 class="text-xl font-semibold">{name(selectedChat)}</h2>
    </a>

    <div id="messages">
      <div class="spacer"></div>
      {#each dates as day}
        <p class="date-header secondary">{formatDate(new Date(day * 86400 * 1000))}</p>
        {@const dayMessages = messageRumours.get(day) ?? []}
        <ul>
          {#each dayMessages as rumour, i (rumour.id)}
            {@const isLastInRun = i === dayMessages.length - 1 || dayMessages[i + 1]?.pubkey !== rumour.pubkey}
            {#if rumour.pubkey === user.pubkey && pTagKeys(rumour).includes(selectedChat.pubkey)}
              <li class="message-row by-user">
                <div
                  class={($theme === "light" ? "light-message " : "dark-message ") + "message"}
                >
                  <ChatMessage content={rumour.content} tags={rumour.tags} />
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
                  <ChatMessage content={rumour.content} tags={rumour.tags} />
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
      <div class="input-row">
        <textarea
          id="message-contents"
          bind:value={text}
          use:focus
          rows="1"
          placeholder={canSend ? "" : $t("dm.relaysNotFound").replace("[R]", selectedChat ? name(selectedChat) : "")}
          disabled={!canSend}
          oninput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 120) + "px";
          }}
          onkeydown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend && text.trim()) sendMessage(text);
            }
          }}
        ></textarea>
        <button
          class="send-btn"
          disabled={!canSend || !text.trim()}
          onmousedown={(e) => e.preventDefault()}
          ontouchstart={(e) => e.preventDefault()}
          onclick={() => sendMessage(text)}
          aria-label="Send"
        >
          <iconify-icon noobserver icon="ph:paper-plane-right-fill" width="22"></iconify-icon>
        </button>
      </div>
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
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 36rem;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .chat-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    flex-shrink: 0;
  }

  .chat-header:hover {
    opacity: 0.8;
  }

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
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    margin-right: -1rem;
    padding-right: 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .spacer {
    flex: 1;
  }

  @media (min-width: 36rem) {
    #messages {
      margin-right: 0;
      padding-right: 0.5rem;
    }
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
    overflow: hidden;
    word-break: break-word;
  }

  .light-message {
    background-color: #ddd;
  }

  .dark-message {
    background-color: #222;
  }

  .input-bar {
    flex-shrink: 0;
    padding: 0.5rem 0;
  }

  .input-row {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .input-row textarea {
    flex: 1;
    resize: none;
    overflow-y: auto;
    line-height: 1.4;
    padding: 0.5rem 0.75rem;
    border-radius: 1.25rem;
    border: 1px solid rgba(128, 128, 128, 0.3);
    background: transparent;
    color: inherit;
    font: inherit;
    min-height: unset;
  }

  .input-row textarea:focus {
    outline: none;
    border-color: rgba(128, 128, 128, 0.6);
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    background: var(--accent, #6366f1);
    color: white;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
  }

  .send-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }
</style>
