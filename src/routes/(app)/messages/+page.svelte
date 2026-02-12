<script lang="ts">
  import { run } from "svelte/legacy";

  import { t } from "$lib/translations";
  import Avatar from "$comp/Avatar.svelte";
  import { event as e, password } from "$lib/store";
  import { browser } from "$app/environment";
  import { decrypt } from "$lib/nostr";

  let { data }: any = $props();

  let messages: any = $state(data.messages);
  let notes: any = $state(data.notes);
  let invoices: any = $state(data.invoices);
  let sent: any = $state(data.sent);
  let received: any = $state(data.received);
  let subject: any = $state(data.subject);
  let user: any = $state(data.user);
  let refresh = (d: any) => ({ messages, notes, invoices, sent, received, subject, user } = d);

  let keys = new Set();
  let latest: any[] = $state([]);
  let ready: any;

  e.subscribe(async (event: any) => {
    if (!(browser && event && ready)) return;
    if (event.recipient?.id === user.id && !~latest.findIndex((m: any) => m.id === event.id)) {
      event.content = await decrypt({ event, user });

      let i = latest.findIndex((m: any) => m.pubkey === event.pubkey);
      let popped;
      if (~i) popped = latest.splice(i, 1);
      else popped = latest.pop();

      latest.unshift(event);
      latest = latest;
    }
  });

  let initialize = async (p: any) => {
    let i = 0;
    ready = false;
    if (!(browser && user)) return;
    while (i < messages.length) {
      let event = messages[i];
      i++;

      if (!(event.author && event.recipient)) continue;

      let k = event.author.id === user.id ? event.recipient?.pubkey : event.author.pubkey;

      if (!keys.has(k)) {
        keys.add(k);
        event.content = await decrypt({ event, user });
        if (event.content) latest.push(event);
      }
    }

    latest = latest;
    ready = true;
  };
  run(() => {
    refresh(data);
  });
  run(() => {
    initialize($password);
  });
</script>

<div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-10">
    {$t("user.messages")}
  </h1>
  {#if latest.length && user?.id === subject.id}
    <div class="relative">
      {#each latest as { content, pubkey, author, recipient }}
        {@const u = author.id === user.id ? recipient : author}
        <a href={`/messages/${u.username}`}>
          <div class="flex hover:bg-gray-100 p-4 rounded-2xl">
            <div class="my-auto">
              <Avatar user={u} size={20} disabled={true} />
            </div>
            <div class="my-auto truncate">
              <div class="my-auto ml-1 text-lg font-bold">{u.username}</div>
              <div class="my-auto ml-1 text-secondary text-lg truncate">{content}</div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {:else}
    <div class="text-center">{$t("user.noMessages")}</div>
  {/if}
</div>
