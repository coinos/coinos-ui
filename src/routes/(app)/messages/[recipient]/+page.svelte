<script>
  import { run, preventDefault } from 'svelte/legacy';

  import { cubicInOut } from "svelte/easing";
  import { browser } from "$app/environment";
  import { t } from "$lib/translations";
  import { format } from "date-fns";
  import { scale, fade, fly } from "svelte/transition";
  import { enhance } from "$app/forms";
  import Avatar from "$comp/Avatar.svelte";
  import { back, fail, focus } from "$lib/utils";
  import { sign, send, encrypt, decrypt } from "$lib/nostr";
  import { event as e, password } from "$lib/store";
  import { tick, onMount } from "svelte";

  let { data } = $props();

  function fadeScale(
    node,
    { delay = 0, duration = 200, easing = (x) => x, baseScale = 0 },
  ) {
    const o = +getComputedStyle(node).opacity;
    const m = getComputedStyle(node).transform.match(/scale\(([0-9.]+)\)/);
    const s = m ? m[1] : 1;
    const is = 1 - baseScale;

    return {
      delay,
      duration,
      css: (t) => {
        const eased = easing(t);
        return `opacity: ${eased * o}; transform: scale(${
          eased * s * is + baseScale
        })`;
      },
    };
  }

  let { messages, recipient, user } = $state(data);
  let input, pane = $state();

  let initialize = async (p) => {
    await Promise.all(
      messages.map(
        async (event) => (event.message = await decrypt({ event, user })),
      ),
    );

    messages = messages;
    tick().then(() => pane && (pane.scrollTop = pane.scrollHeight));
  };

  e.subscribe(async (event) => {
    let found = ~messages.findIndex((m) => m.id === event?.id);
    if (event?.recipient.id === user.id && !found) {
      event.message = await decrypt({ event, user });
      messages.push(event);
      messages = messages;
      tick().then(() => pane && (pane.scrollTop = pane.scrollHeight));
    }
  });

  let sent, submitting, message = $state();
  let submit = async () => {
    submitting = true;

    let event = {
      pubkey: user.pubkey,
      created_at: Math.floor(Date.now() / 1000),
      kind: 4,
      tags: [["p", recipient.pubkey]],
    };

    event.message = message;

    message = "";

    event.author = user;
    event.recipient = recipient;

    messages.push(event);
    messages = messages;
    tick().then(() => pane && (pane.scrollTop = pane.scrollHeight));

    try {
      event.content = await encrypt({
        message: event.message,
        recipient: recipient.pubkey,
        user,
      });
      const { getEventHash } = await import("nostr-tools");
      event.id = getEventHash(event);
      await sign(event);
      await send(event);

      sent = true;
    } catch (e) {
      console.log(e);
      fail("Failed to send message");
    }

    message = "";
    submitting = false;
  };

  let keydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };
  run(() => {
    initialize($password);
  });
</script>

<div class="container max-w-xl mx-auto px-4 space-y-5">
  <button
    type="button"
    class="hover:opacity-80"
    data-sveltekit-preload-data="false"
    onclick={back}
  >
    <iconify-icon noobserver icon="ph:arrow-left-bold" width="40"></iconify-icon>
  </button>

  <div
    class="h-[50vh] max-h-[50vh] overflow-y-scroll scrollbar-thin scrollbar-thumb-[#F2F6FC] scrollbar-track-white pr-8"
    bind:this={pane}
  >
    {#each messages as { id, author, message, created_at, pubkey }}
      {@const ours = pubkey === user.pubkey}
      {@const theirs = !ours}

      {#if message}
        <div
          class="flex gap-2"
          class:flex-row-reverse={theirs}
          class:justify-end={theirs}
          in:fadeScale={{
            easing: cubicInOut,
            baseScale: 0.5,
          }}
        >
          <div
            class="rounded-2xl px-4 py-2 max-w-[300px] mb-1 text-lg"
            class:ours
            class:theirs
          >
            {message}
          </div>
          <div class="mt-auto">
            <Avatar user={author} size={"12"} />
          </div>
        </div>
        <div class="text-sm text-gray-400 mb-6" class:text-right={ours}>
          {format(new Date(created_at * 1000), "MMM d")},
          {format(new Date(created_at * 1000), "h:mm aa")}
        </div>
      {/if}
    {/each}
  </div>

  <form
    method="POST"
    class="w-full border rounded-xl outline-none gap-4 flex p-0 pr-2"
    onsubmit={preventDefault(submit)}
  >
    <input type="hidden" name="requester_id" value={user.id} />
    <input type="hidden" name="recipient" value={recipient.username} />

    <div
      use:focus
      contenteditable
      class="grow break-all py-4 outline-none mt-0 pl-4"
      bind:innerHTML={message}
      onkeydown={keydown}
      role="textbox"
      aria-multiline="true"
      aria-label="Message"
      tabindex="0"
    ></div>
    <button type="submit" class="my-auto shrink-0">
      <iconify-icon noobserver icon="ph:paper-plane-right-bold" width="32"
      ></iconify-icon>
    </button>
  </form>
</div>

<style>
  @reference "../../../../app.css";

  .ours {
    @apply bg-gradient-to-r from-[#F2F6FC] to-[#E1E3FF] text-black rounded-br-none ml-auto;
  }

  .theirs {
    @apply bg-gray-100 text-black rounded-bl-none;
  }
</style>
