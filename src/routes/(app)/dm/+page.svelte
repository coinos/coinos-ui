<script lang="ts">
  import { tick, onMount, onDestroy } from "svelte";

  import { isValid, queryProfile } from "nostr-tools/nip05";
  import * as toolsnip17 from "nostr-tools/nip17";

  import { getNostrUserInfo } from "$lib/nip01";
  import { relaysSupporting } from "$lib/nip11";
  import { getMessageRumours } from "$lib/nip17";
  import * as libnip17 from "$lib/nip17";
  import { npubEncode, decode } from "nostr-tools/nip19";
  // import { mute, unmute, mutedAccounts } from "$lib/nip51";
  import { sign, getPrivateKey, pTagKeys } from "$lib/nostr";
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

  (() => {
    if (!data.user) {
      window.location.replace("/login");
    }
  })();

  /// chat selection
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

    const nostrUserInfo = (await getNostrUserInfo(pubkey)) || {};
    const valid = "nip05" in nostrUserInfo && (await isValid(pubkey, nostrUserInfo.nip05));
    const coinosUser = await coinosUserFromPubkey(pubkey);
    return {
      coinosUsername: coinosUser?.username || null,
      picture: coinosUser?.picture || nostrUserInfo?.picture || null,
      nostrName: nostrUserInfo?.name,
      nip05: nostrUserInfo?.nip05,
      nip05Valid: valid,
      pubkey,
    };
  };

  const name = (userInfo: any): string => {
    return userInfo.coinosUsername || userInfo.nostrName || $t("dm.anonymous");
  };

  const rumourInvolves = (rumour: any, pubkey: string) => {
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

  const updateSendersRecipients = async (rumours: any[]) => {
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
    messageSenders = Array.from(senders);
    messageRecipients = Array.from(recipients);

    const chatMap = new Map<string, any>();
    for (const sender of senders) {
      chatMap.set(sender.pubkey, sender);
    }
    for (const recipient of recipients) {
      chatMap.set(recipient.pubkey, recipient);
    }
    chats = Array.from(chatMap.values());
    chats.sort(
      (a, b) =>
        (mostRecentCommunication(rumours, b.pubkey) ?? 0) -
        (mostRecentCommunication(rumours, a.pubkey) ?? 0),
    );
  };

  let messageSenders: any[] = $state([]);
  let messageRecipients: any[] = $state([]);
  let chats: any[] = $state([]);
  (() => getMessageRumours(data.user).then(updateSendersRecipients))();

  let selectedChat: any = $state(null);
  let creatingNewChat = $state(false);
  let searchQuery = $state("");

  /// individual chat
  let text = $state("");
  let allRumours: any[] = $state([]);
  let messageRumours: any = $state([]);
  let dates: any[] = $state([]);
  let relayWarningShown = $state(false);
  let canSend = $state(false);
  let nostrUserInfo: any = $state({});

  const selectedChatEmpty = () => !messageRumours || messageRumours.size == 0;

  const removeChat = (pubkey: string) => {
    for (let i = 0; i < chats.length; i++) {
      if (chats[i].pubkey === pubkey) {
        chats.splice(i, 1);
      }
    }
  };

  const includesPubkey = (chats: any[], pubkey: string) => {
    for (const c of chats) {
      if (c.pubkey === pubkey) {
        return true;
      }
    }
    return false;
  };

  const selectChat = (c: any) => {
    if (selectedChat && selectedChatEmpty()) {
      removeChat(selectedChat.pubkey);
    }

    selectedChat = c;
    if (!selectedChat) {
      return;
    }
    if (!includesPubkey(chats, c.pubkey)) {
      chats.unshift(c);
    }
    userInfo(selectedChat.pubkey).then((info) => (nostrUserInfo = info));
    libnip17.getPreferredRelays(selectedChat.pubkey).then((relays) => {
      canSend = relays && relays.length > 0;
    });
    updateEvents();
  };

  const selectChatUsername = async (username: string) => {
    const response = await fetch(`/api/users/${username}`);
    if (!response.ok) {
      alert($t("dm.usernameNotFound"));
      return;
    }
    const coinosUserInfo = await response.json();
    selectChatPubkey(coinosUserInfo.pubkey);
  };

  const selectChatNip05 = async (nip05: string) => {
    const response = await queryProfile(nip05);
    if (response == null) {
      alert($t("dm.nip05NotFound"));
      return;
    }
    selectChatPubkey(response.pubkey);
  };

  const selectChatPubkey = async (pubkey: string) => {
    selectChat(await userInfo(pubkey));
    creatingNewChat = false;
  };

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("username")) {
      selectChatUsername(urlParams.get("username")!);
    } else if (urlParams.get("nip05")) {
      selectChatNip05(urlParams.get("nip05")!);
    } else if (urlParams.get("pubkey")) {
      selectChatPubkey(urlParams.get("pubkey")!);
    }
  });

  const appendMultimap = (map: Map<any, any>, key: any, value: any) => {
    if (map.has(key)) {
      map.get(key)!.push(value);
    } else {
      map.set(key, [value]);
    }
  };

  const dateMap = (events: any[]): Map<any, any> => {
    let eventsMap = new Map();
    for (const event of events) {
      const created = Math.floor(event.created_at / 86400);
      appendMultimap(eventsMap, created, event);
    }
    for (const [date, dateEvents] of eventsMap) {
      dateEvents.sort((ev1, ev2) => ev1.created_at - ev2.created_at);
    }
    return eventsMap;
  };

  const updateEvents = async () => {
    allRumours = await libnip17.getMessageRumours(user);
    const rumours = allRumours.filter(
      (r) =>
        (r.pubkey === user.pubkey && pTagKeys(r).includes(selectedChat.pubkey)) ||
        (r.pubkey === selectedChat.pubkey && pTagKeys(r).includes(user.pubkey)),
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
  const NEAR_DISTANCE = 182 * 24 * 60 * 60 * 1000; // around 6 months
  const formatDate = (date: Date): string => {
    if (date.getTime() >= Date.now() - NEAR_DISTANCE) {
      return NEAR_DATE.format(date);
    } else {
      return FAR_DATE.format(date);
    }
  };

  let sendError = $state("");

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
      // Add rumour to the full list if not already present
      if (!allRumours.find((r) => r.id === rumour.id)) {
        allRumours = [...allRumours, rumour];
        await updateSendersRecipients(allRumours);
      }

      // If this rumour belongs to the current chat, add it to the display
      if (
        selectedChat &&
        ((rumour.pubkey === user.pubkey && pTagKeys(rumour).includes(selectedChat.pubkey)) ||
          (rumour.pubkey === selectedChat.pubkey && pTagKeys(rumour).includes(user.pubkey)))
      ) {
        const dayKey = Math.floor(rumour.created_at / 86400);
        if (messageRumours.has(dayKey)) {
          const dayMsgs = messageRumours.get(dayKey);
          if (!dayMsgs.find((r: any) => r.id === rumour.id)) {
            dayMsgs.push(rumour);
            dayMsgs.sort((a: any, b: any) => a.created_at - b.created_at);
          }
        } else {
          messageRumours.set(dayKey, [rumour]);
        }
        dates = Array.from(messageRumours.keys()).sort((a, b) => a - b);
        // Force reactivity
        messageRumours = new Map(messageRumours);

        await tick();
        scrollChat();
      }
    }).then((close) => (closeSub = close));
  });

  onDestroy(() => closeSub?.());

  // let muted = $state(new Set<string>());
  // (() => mutedAccounts(data.user).then((m) => (muted = m)))();

  // const toggleMute = async (pubkey: string) => {
  //   if (muted && muted.has(pubkey)) {
  //     await unmute(user, pubkey);
  //   } else {
  //     await mute(user, pubkey, true);
  //   }
  //   muted = await mutedAccounts(user);
  // };
</script>

<div class="super-container">
  <div class={"sidebar " + ($theme === "light" ? "light-sidebar" : "dark-sidebar")}>
    <h2 class="text-xl chat-header">
      {creatingNewChat ? $t("dm.newChatHeader") : $t("dm.chatHeader")}
      <button
        class={"chat-btn push-right " +
        ($theme === "light" ? "light-chat-btn" : "dark-chat-btn") +
        (creatingNewChat ? ($theme === "light" ? " light-selected" : " dark-selected") : "")}
        onclick={() => {
          creatingNewChat = !creatingNewChat;
          selectChat(null);
          searchQuery = "";
        }}
      >
        +
      </button>
    </h2>
    {#if creatingNewChat}
      <input
        type="text"
        class="short"
        bind:value={searchQuery}
        placeholder={$t("dm.searchPrompt")}
      />
    {/if}
    {#if !creatingNewChat}
      {#each chats as c}
        <button
          class={"chat-btn tall-btn " +
          ($theme === "light" ? "light-chat-btn" : "dark-chat-btn") +
          (selectedChat && selectedChat.pubkey == c.pubkey
            ? $theme === "light"
              ? " light-selected"
              : " dark-selected"
            : "")}
          onclick={() => selectChat(c)}
        >
          {#if c.picture}
            <img src={c.picture} alt={name(c)} class="sidebar-avatar" />
          {/if}
          <span class="text-xl">{name(c)}</span>
        </button>
      {/each}
    {:else if searchQuery !== ""}
      <button
        class={"chat-btn tall-btn " + ($theme === "light" ? "light-chat-btn" : "dark-chat-btn")}
        onclick={() => selectChatUsername(searchQuery)}
      >
        <span class="text-xl">{$t("dm.findByUsername")}</span>
      </button>
      {#if searchQuery.includes(".")}
        <button
          class={"chat-btn tall-btn " + ($theme === "light" ? "light-chat-btn" : "dark-chat-btn")}
          onclick={() => selectChatNip05(searchQuery)}
        >
          <span class="text-xl">{$t("dm.findByNIP05")}</span>
        </button>
      {/if}
      {#if searchQuery.length === 64 || searchQuery.slice(0, 4) === "npub"}
        <button
          class={"chat-btn tall-btn " + ($theme === "light" ? "light-chat-btn" : "dark-chat-btn")}
          onclick={() => selectChatPubkey(searchQuery)}
        >
          <span class="text-xl">{$t("dm.findByPubkey")}</span>
        </button>
      {/if}
    {/if}
  </div>
  <div
    class="main container space-y-2 mx-auto space-y-5 lg:max-w-xl xl:max-w-2xl lg:pl-10 mt-5 lg:mt-0"
  >
    <h1 class="text-5xl font-medium text-left w-full mx-auto lg:mx-0 md:w-[500px]">
      {$t("dm.header")}
    </h1>

    {#if selectedChat}
      <div id="messages">
        {#each dates as day}
          <p class="date-header secondary">{formatDate(new Date(day * 86400 * 1000))}</p>
          <ul>
            {#each messageRumours.get(day) as rumour, i}
              {@const dayMessages = messageRumours.get(day)}
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
                    <img src={user.picture} alt={user.username} class="msg-avatar" />
                  {:else}
                    <div class="msg-avatar-placeholder"></div>
                  {/if}
                </li>
              {:else if rumour.pubkey === selectedChat.pubkey && pTagKeys(rumour).includes(user.pubkey)}
                <li class="message-row by-other">
                  {#if isLastInRun && selectedChat.picture}
                    <img src={selectedChat.picture} alt={name(selectedChat)} class="msg-avatar" />
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
          : $t("dm.relaysNotFound").replace("[R]", name(selectedChat))}
          onclick={async () => sendMessage(text)}
        />
        {#if sendError}
          <p class="warning"><em>{sendError}</em></p>
        {/if}
      </div>
    {:else if chats.length == 0}
      <p>{$t("dm.noChats")}</p>
    {:else}
      <p>{$t("dm.selectChat")}</p>
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

  .short {
    height: 1.5em;
    margin-bottom: 10px;
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .sidebar-avatar {
    width: 32px;
    height: 32px;
    border-radius: 9999px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .push-right {
    margin-left: auto;
  }

  .chat-header {
    margin: 1em 15px 0.5em;
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
