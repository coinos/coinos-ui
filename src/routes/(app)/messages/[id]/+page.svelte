<script lang="ts">
  import PhPaperPlaneRightFill from "virtual:icons/ph/paper-plane-right-fill";
  import PhPlusBold from "virtual:icons/ph/plus-bold";
  import { tick, onMount, onDestroy } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";

  import {
    getGroups, getGroupRumours, sendGroupMessage,
    sendGroupMediaMessage,
    subscribeToMessages, fetchGroupHistory,
    findOrCreateDmGroup,
    resolveUser, displayName,
    decryptMediaUrl,
  } from "$lib/messaging";
  import type { GroupInfo } from "$lib/messaging";
  import { t } from "$lib/translations";
  import { theme } from "$lib/store";
  import ChatMessage from "$comp/ChatMessage.svelte";
  import Avatar from "$comp/Avatar.svelte";

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
  const id: string = $derived(page.params.id!);

  onMount(() => {
    if (!data.user) {
      window.location.replace("/login");
    }
  });

  let groupId = $state("");
  let groupInfo: GroupInfo | undefined = $state(undefined);
  let text = $state("");
  let messageRumours: Map<number, any[]> = $state(new Map());
  let dates: number[] = $state([]);
  let sendError = $state("");
  let uploading = $state(false);
  let senderInfos = $state(new Map<string, any>());

  const groupDisplayName = (g: GroupInfo | undefined): string => {
    if (!g) return "…";
    if (g.name) return g.name;
    // Use group members, or fall back to unique sender pubkeys from messages
    let otherPks = g.members.filter((pk) => pk !== user.pubkey);
    if (otherPks.length === 0) {
      const senderPks = new Set<string>();
      for (const [, dayRumours] of messageRumours) {
        for (const r of dayRumours) {
          if (r.pubkey && r.pubkey !== user.pubkey) senderPks.add(r.pubkey);
        }
      }
      otherPks = Array.from(senderPks);
    }
    const names = otherPks.map((pk) => {
      const info = senderInfos.get(pk);
      return info ? displayName(info) : "…";
    });
    return names.join(", ") || "…";
  };

  const dateMap = (rumours: any[]): Map<number, any[]> => {
    const m = new Map<number, any[]>();
    for (const r of rumours) {
      const day = Math.floor(r.created_at / 86400);
      if (m.has(day)) m.get(day)!.push(r);
      else m.set(day, [r]);
    }
    for (const [, dayRumours] of m) {
      dayRumours.sort((a: any, b: any) => a.created_at - b.created_at);
    }
    return m;
  };

  type SenderRun = { pubkey: string; messages: any[] };

  /** Group a flat list of rumours into consecutive sender runs. */
  const senderRuns = (rumours: any[]): SenderRun[] => {
    const runs: SenderRun[] = [];
    for (const r of rumours) {
      const last = runs[runs.length - 1];
      if (last && last.pubkey === r.pubkey) {
        last.messages.push(r);
      } else {
        runs.push({ pubkey: r.pubkey, messages: [r] });
      }
    }
    return runs;
  };

  const updateMessages = () => {
    const rumours = getGroupRumours(groupId);
    messageRumours = dateMap(rumours);
    dates = Array.from(messageRumours.keys()).sort((a, b) => a - b);
  };

  const loadGroup = async () => {
    await fetchGroupHistory(user);

    // If `id` is a 64-char hex string and not a known group, treat as pubkey (profile DM link)
    const groups = await getGroups(user);
    let found = groups.find((g) => g.groupId === id);

    if (!found && /^[0-9a-f]{64}$/.test(id)) {
      try {
        const newGroupId = await findOrCreateDmGroup(user, id);
        groupId = newGroupId;
        const updatedGroups = await getGroups(user);
        found = updatedGroups.find((g) => g.groupId === newGroupId);
        goto(`/messages/${newGroupId}`, { replaceState: true });
      } catch (e: any) {
        console.error("[messages] Failed to create DM group:", e);
        sendError = e.message || "Failed to start conversation";
        return;
      }
    } else {
      groupId = id;
    }

    groupInfo = found;
    updateMessages();

    // Resolve names for group members AND rumour senders
    const pubkeysToResolve = new Set<string>();
    if (groupInfo) {
      for (const pk of groupInfo.members) pubkeysToResolve.add(pk);
    }
    for (const [, dayRumours] of messageRumours) {
      for (const r of dayRumours) {
        if (r.pubkey) pubkeysToResolve.add(r.pubkey);
      }
    }
    for (const pk of pubkeysToResolve) {
      if (pk === user.pubkey || senderInfos.has(pk)) continue;
      resolveUser(pk).then((info) => {
        senderInfos = new Map(senderInfos).set(pk, info);
      });
    }

    await tick();
    scrollChat();
  };

  const senderName = (pubkey: string): string => {
    if (pubkey === user.pubkey) return user.username || "You";
    const info = senderInfos.get(pubkey);
    return info ? displayName(info) : "…";
  };

  const senderUser = (pubkey: string): any => {
    if (pubkey === user.pubkey) return user;
    const info = senderInfos.get(pubkey);
    return { pubkey, username: info?.coinosUsername, picture: info?.picture };
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
    return date.getTime() >= Date.now() - NEAR_DISTANCE
      ? NEAR_DATE.format(date)
      : FAR_DATE.format(date);
  };

  const sendMessage = async (message: string) => {
    sendError = "";
    text = "";
    const ta = document.getElementById("message-contents") as HTMLTextAreaElement;
    if (ta) {
      ta.style.height = "auto";
      ta.focus();
    }

    // Optimistic UI
    const optimistic = {
      id: crypto.randomUUID(),
      kind: 14,
      created_at: Math.floor(Date.now() / 1000),
      pubkey: user.pubkey,
      content: message,
      tags: [],
      _groupId: groupId,
    };
    const dayKey = Math.floor(optimistic.created_at / 86400);
    const existing = messageRumours.get(dayKey);
    if (existing) {
      messageRumours = new Map(messageRumours).set(dayKey, [...existing, optimistic]);
    } else {
      messageRumours = new Map(messageRumours).set(dayKey, [optimistic]);
    }
    dates = Array.from(messageRumours.keys()).sort((a: number, b: number) => a - b);
    await tick();
    scrollChat();

    try {
      await sendGroupMessage(user, groupId, message);
    } catch (e: any) {
      console.error("Failed to send message:", e);
      sendError = $t("dm.sendFailed");
    }
  };

  const sendMedia = async (file: File) => {
    sendError = "";
    uploading = true;
    try {
      await sendGroupMediaMessage(user, groupId, file);
      updateMessages();
      await tick();
      scrollChat();
    } catch (e: any) {
      console.error("Failed to send media:", e);
      sendError = e.message || "Failed to send media";
    } finally {
      uploading = false;
    }
  };

  let closeSub: (() => void) | undefined;

  onMount(() => {
    loadGroup();

    const vv = window.visualViewport;
    if (vv) {
      const onResize = () => scrollChat();
      vv.addEventListener("resize", onResize);
      return () => vv.removeEventListener("resize", onResize);
    }
  });

  onMount(() => {
    subscribeToMessages(user, async (rumour) => {
      if (rumour._groupId !== groupId) return;
      if (rumour.pubkey === user.pubkey) return;

      if (!senderInfos.has(rumour.pubkey)) {
        resolveUser(rumour.pubkey).then((info) => {
          senderInfos = new Map(senderInfos).set(rumour.pubkey, info);
        });
      }

      updateMessages();
      await tick();
      scrollChat();
    }).then((close) => (closeSub = close));
  });

  onDestroy(() => closeSub?.());
</script>

<div class="chat-container">
  <div class="chat-header">
    <h2 class="text-xl font-semibold">{groupDisplayName(groupInfo)}</h2>
    {#if groupInfo && groupInfo.members.length > 2}
      <span class="text-secondary text-sm">{groupInfo.members.length} members</span>
    {/if}
  </div>

  <div id="messages">
    <div class="spacer"></div>
    {#each dates as day}
      <p class="date-header secondary">{formatDate(new Date(day * 86400 * 1000))}</p>
      {@const dayMessages = messageRumours.get(day) ?? []}
      <ul>
        {#each senderRuns(dayMessages) as run}
          <li class="sender-run">
            <div class="run-avatar">
              <Avatar user={senderUser(run.pubkey)} size={16} disabled />
            </div>
            <div class="run-messages">
              {#each run.messages as rumour, j (rumour.id)}
                <div
                  class={(j === run.messages.length - 1 ? "bubble-tail " : "") + (j === 0 ? "bubble-first " : "") + ($theme === "light" ? "light-message " : "dark-message ") + "message"}
                >
                  {#if j === 0}
                    <div class="sender-name">{senderName(run.pubkey)}</div>
                  {/if}
                  <ChatMessage content={rumour.content} tags={rumour.tags} decryptMedia={(tag) => decryptMediaUrl(groupId, tag)} />
                  <span class="timestamp secondary text-xs">
                    {TIME.format(new Date(rumour.created_at * 1000))}
                  </span>
                </div>
              {/each}
            </div>
          </li>
        {/each}
      </ul>
    {/each}
    <div id="messages-end"></div>
  </div>

  <input
    type="file"
    accept="image/*,video/*,audio/*"
    id="media-upload"
    hidden
    onchange={(e) => {
      const file = (e.currentTarget as HTMLInputElement).files?.[0];
      if (file) sendMedia(file);
      (e.currentTarget as HTMLInputElement).value = "";
    }}
  />

  <div class="input-bar">
    <div class="input-row">
      <button
        class="attach-btn"
        disabled={uploading || !groupId}
        onclick={() => document.getElementById("media-upload")?.click()}
        aria-label="Attach media"
      >
        {#if uploading}
          <span class="spinner"></span>
        {:else}
          <PhPlusBold width="20" />
        {/if}
      </button>
      <textarea
        id="message-contents"
        bind:value={text}
        use:focus
        rows="1"
        oninput={(e) => {
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = Math.min(el.scrollHeight, 120) + "px";
        }}
        onkeydown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (text.trim() && groupId) sendMessage(text);
          }
        }}
      ></textarea>
      <button
        class="send-btn"
        disabled={!text.trim() || !groupId}
        onmousedown={(e) => e.preventDefault()}
        ontouchstart={(e) => e.preventDefault()}
        onclick={() => sendMessage(text)}
        aria-label="Send"
      >
        <PhPaperPlaneRightFill width="22" />
      </button>
    </div>
    {#if sendError}
      <p class="warning"><em>{sendError}</em></p>
    {/if}
  </div>
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
    align-items: baseline;
    gap: 0.75rem;
    padding: 0.5rem 0;
    flex-shrink: 0;
  }

  .warning {
    color: #ff7f00;
  }

  .secondary {
    color: #7f7f7f;
  }

  .sender-run {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .run-avatar {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    margin-bottom: -6px;
  }

  .run-messages {
    max-width: calc(85% - 3rem);
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .sender-name {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--accent, #6366f1);
    margin-bottom: 1px;
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
    padding: 0.35em 0.75em;
    width: fit-content;
    max-width: 100%;
    border-radius: 12px;
    overflow: visible;
    word-break: break-word;
    position: relative;
  }

  .bubble-tail {
    border-bottom-left-radius: 4px;
  }

  .bubble-tail::before {
    content: "";
    position: absolute;
    bottom: 0;
    left: -8px;
    width: 10px;
    height: 16px;
    clip-path: path('M10 0 C10 7 2 13 0 16 L10 16 Z');
  }

  .light-message {
    background-color: #e4e4e4;
  }

  .light-message.bubble-tail::before {
    background: #e4e4e4;
  }

  .dark-message {
    background-color: #2a2a2a;
  }

  .dark-message.bubble-tail::before {
    background: #2a2a2a;
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

  .attach-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 9999px;
    background: transparent;
    color: inherit;
    border: 1px solid rgba(128, 128, 128, 0.3);
    cursor: pointer;
    flex-shrink: 0;
    opacity: 0.7;
  }

  .attach-btn:hover {
    opacity: 1;
  }

  .attach-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(128, 128, 128, 0.3);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
