<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  import {
    getGroups, subscribeToMessages, fetchGroupHistory,
    resolveUser, displayName,
  } from "$lib/messaging";
  import type { GroupInfo } from "$lib/messaging";
  import { t } from "$lib/translations";

  let { data } = $props();
  const user = $derived(data.user);

  onMount(() => {
    if (!data.user) {
      window.location.replace("/login");
    }
  });

  let groups: GroupInfo[] = $state([]);
  let loaded = $state(false);
  let memberNames = $state(new Map<string, Map<string, string>>());

  const groupDisplayName = (g: GroupInfo): string => {
    if (g.name) return g.name;
    const names = memberNames.get(g.groupId);
    if (!names) return "…";
    const otherNames = g.members
      .filter((pk) => pk !== user.pubkey)
      .map((pk) => names.get(pk) || shortPk(pk));
    return otherNames.join(", ") || "Empty group";
  };

  const shortPk = (pk: string) => pk.slice(0, 8) + "…";

  const resolveMemberNames = async (groups: GroupInfo[]) => {
    const updated = new Map(memberNames);
    for (const g of groups) {
      if (!updated.has(g.groupId)) updated.set(g.groupId, new Map());
      const gMap = updated.get(g.groupId)!;
      for (const pk of g.members) {
        if (pk === user.pubkey || gMap.has(pk)) continue;
        resolveUser(pk).then((info) => {
          gMap.set(pk, displayName(info));
          memberNames = new Map(updated);
        });
      }
    }
    memberNames = updated;
  };

  const loadGroups = async () => {
    await fetchGroupHistory(user);
    groups = await getGroups(user);
    resolveMemberNames(groups);
    loaded = true;
  };

  let closeSub: (() => void) | undefined;

  onMount(() => {
    loadGroups();
    subscribeToMessages(user, async () => {
      groups = await getGroups(user);
      resolveMemberNames(groups);
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
        <div class="w-12 h-12 rounded-full bg-base-300 shrink-0 flex items-center justify-center text-lg font-bold text-base-content/40">
          {g.members.length}
        </div>
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
