<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  import {
    getGroups, subscribeToMessages, fetchGroupHistory,
    searchMlsUsers, preloadMlsUsers, resolveUser, displayName,
  } from "$lib/messaging";
  import type { GroupInfo } from "$lib/messaging";
  import { t } from "$lib/translations";
  import Avatar from "$comp/Avatar.svelte";

  const focus = (el: HTMLElement) => el.focus();

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

  // Search state
  let query = $state("");
  let searchResults: any[] = $state([]);

  const onSearchInput = async () => {
    if (!query.trim()) { searchResults = []; return; }
    searchResults = (await searchMlsUsers(query)).filter((u) => u.pubkey !== user.pubkey);
  };

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

  const refreshGroups = async () => {
    const allGroups = await getGroups(user);
    groups = allGroups.filter((g) => g.members.includes(user.pubkey));
    resolveMembers(groups);
  };

  let closeSub: (() => void) | undefined;
  onMount(() => {
    // Show cached groups immediately, then fetch history in background
    refreshGroups().then(() => { loaded = true; });
    fetchGroupHistory(user).then(refreshGroups);
    preloadMlsUsers();
    subscribeToMessages(user, refreshGroups).then((close) => (closeSub = close));
  });

  onDestroy(() => closeSub?.());
</script>

<div class="container mx-auto max-w-xl px-4 space-y-1">
  <input
    use:focus
    type="text"
    bind:value={query}
    oninput={onSearchInput}
    placeholder={$t("dm.searchMls")}
    class="w-full px-4 py-2 rounded-full border border-base-300 bg-base-100 text-base-content focus:outline-none focus:border-base-content/30 mb-2"
  />

  {#if query.trim()}
    {#if searchResults.length === 0}
      <p class="text-center text-secondary py-4">{$t("dm.noResults")}</p>
    {:else}
      {#each searchResults as u}
        <a href="/messages/{u.pubkey}" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-base-200">
          <div class="shrink-0">
            <Avatar user={{ pubkey: u.pubkey, username: u.name, picture: u.picture }} size={12} disabled />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-lg truncate">{u.name || u.pubkey.slice(0, 12) + "…"}</div>
            {#if u.nip05}
              <div class="text-secondary text-sm truncate">{u.nip05}</div>
            {/if}
          </div>
        </a>
      {/each}
    {/if}
  {:else if !loaded}
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

