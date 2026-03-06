<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  import {
    getGroups, subscribeToMessages, fetchGroupHistory,
    resolveUser, displayName,
  } from "$lib/messaging";
  import type { GroupInfo } from "$lib/messaging";
  import { t } from "$lib/translations";
  import Avatar from "$comp/Avatar.svelte";

  let { data } = $props();
  const user = $derived(data.user);

  onMount(() => {
    if (!data.user) {
      window.location.replace("/login");
    }
  });

  let groups: GroupInfo[] = $state([]);
  let loaded = $state(false);
  let memberInfos = $state(new Map<string, any>());

  const otherMembers = (g: GroupInfo) => g.members.filter((pk) => pk !== user.pubkey);

  const groupDisplayName = (g: GroupInfo): string => {
    if (g.name) return g.name;
    const names = otherMembers(g)
      .map((pk) => { const i = memberInfos.get(pk); return i ? displayName(i) : "…"; });
    return names.join(", ") || "…";
  };

  const peerUser = (g: GroupInfo): any | null => {
    if (g.members.length !== 2) return null;
    const peer = otherMembers(g)[0];
    if (!peer) return null;
    const info = memberInfos.get(peer);
    return { pubkey: peer, username: info?.coinosUsername, picture: info?.picture };
  };

  const resolveMembers = async (groups: GroupInfo[]) => {
    for (const g of groups) {
      for (const pk of g.members) {
        if (pk === user.pubkey || memberInfos.has(pk)) continue;
        resolveUser(pk).then((info) => {
          memberInfos = new Map(memberInfos).set(pk, info);
        });
      }
    }
  };

  const loadGroups = async () => {
    await fetchGroupHistory(user);
    const allGroups = await getGroups(user);
    groups = allGroups.filter((g) => g.members.includes(user.pubkey));
    resolveMembers(groups);
    loaded = true;
  };

  let closeSub: (() => void) | undefined;

  onMount(() => {
    loadGroups();
    subscribeToMessages(user, async () => {
      const allGroups = await getGroups(user);
      groups = allGroups.filter((g) => g.members.includes(user.pubkey));
      resolveMembers(groups);
    }).then((close) => (closeSub = close));
  });

  onDestroy(() => closeSub?.());
</script>

<div class="container mx-auto max-w-xl px-4 space-y-1">
  {#if !loaded}
    <div class="flex justify-center py-8"><div class="loading loading-spinner"></div></div>
  {:else if groups.length === 0}
    <p class="text-center text-secondary">{$t("dm.noChats")}</p>
  {:else}
    {#each groups as g}
      <a href="/messages/{g.groupId}" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-base-200">
        {#if peerUser(g)}
          <div class="shrink-0">
            <Avatar user={peerUser(g)} size={12} disabled />
          </div>
        {:else}
          <div class="w-12 h-12 rounded-full bg-base-300 shrink-0 flex items-center justify-center text-lg font-bold text-base-content/40">
            {g.members.length}
          </div>
        {/if}
        <div class="min-w-0 flex-1">
          <div class="font-semibold text-lg truncate">{groupDisplayName(g)}</div>
          {#if g.lastMessage}
            <div class="text-secondary text-sm truncate">{g.lastMessage}</div>
          {/if}
        </div>
      </a>
    {/each}
  {/if}
</div>
