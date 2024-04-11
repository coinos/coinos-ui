<script>
  import { hexToUint8Array } from "uint8array-extras";
  import { copy, f, post, s, sats, success, fail } from "$lib/utils";
  import Icon from "$comp/Icon.svelte";
  import { t } from "$lib/translations";
  import { sign, send } from "$lib/nostr";
  import { bech32m } from "@scure/base";
  import { page } from "$app/stores";

  export let data;

  let { encode, toWords } = bech32m;
  let events, user, subject, src, text;

  $: ({ events, user, subject, src, rates, text } = data);
  $: ({ currency, username: n, display } = subject);

  $: username = n.length > 60 ? n.substr(0, 6) : display || n;
  $: npub =
    subject.pubkey &&
    bech32m.encode("npub", toWords(hexToUint8Array(subject.pubkey)), 180);
  $: lnaddr = `${n}@${$page.url.host}`;
  $: profile = `${$page.url.host}/${n}`;

  let follow = async () => {
    user.follows.push([
      "p",
      subject.pubkey,
      "wss://nostr.coinos.io",
      subject.username,
    ]);
    update();
  };

  let unfollow = async () => {
    user.follows.splice(
      user.follows.findIndex((t) => t[1] === subject.pubkey),
      1
    );
    update();
  };

  let update = async () => {
    let event = {
      pubkey: user.pubkey,
      created_at: Math.floor(Date.now() / 1000),
      kind: 3,
      content: "",
      tags: user.follows,
    };

    await sign({ event, user });
    await send(event);

    user.follows = user.follows;
  };

  $: following = !!user?.follows.find((t) => t.includes(subject.pubkey));

  let showBio;
  let toggleBio = () => (showBio = !showBio);

  let showDetails;
  let toggleDetails = () => (showDetails = !showDetails);

  let password;

  let reset = async () => {
    try {
      await post(`/${subject.username}/reset`, { password });
      success("Password reset");
    } catch (e) {
      fail(e.message);
    }
  };
</script>

<div class="container mx-auto w-full px-4 flex flex-wrap lg:flex-nowrap">
  <div class="hidden lg:block lg:w-[280px] xl:w-[360px]" />
  <div
    class="w-full lg:w-[280px] xl:w-[360px] lg:absolute space-y-5 left-20 mx-auto mb-5"
  >
    <div
      class="flex text-3xl font-bold text-center mx-auto justify-center gap-2"
    >
      <div class="my-auto break-words w-full">{display || username}</div>
    </div>

    {#if subject.address}
      <div
        class="text-secondary mx-auto text-center lg:mx-0"
        class:line-clamp-2={!showBio}
        on:click={toggleBio}
        on:keydown={toggleBio}
      >
        {subject.address}
      </div>
    {/if}

    <div class="flex justify-center gap-2">
      <a href={`/${subject.pubkey}/follows`}
        ><b>{subject.follows.length}</b>
        <span class="text-secondary">{$t("user.following")}</span></a
      >
      <a href={`/${subject.pubkey}/followers`}
        ><b>{subject.followers.length}</b>
        <span class="text-secondary">{$t("user.followers")}</span></a
      >
    </div>

    <div class="flex flex-wrap gap-2 w-full text-xl">
      {#if user && user.username !== subject.username && subject.pubkey}
        {#if following}
          <button
            class="mx-auto rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex bg-black text-white grow"
            on:click={unfollow}
          >
            <div class="mx-auto flex">
              <Icon icon={"profile"} style="my-auto w-8 mr-2 invert" />
              <div class="my-auto">{$t("user.following")}</div>
            </div>
          </button>
        {:else}
          <button
            class="mx-auto rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex grow"
            on:click={follow}
          >
            <div class="mx-auto flex">
              <Icon icon={"profile"} style="my-auto h-6 mr-2" />
              <div class="my-auto">{$t("user.follow")}</div>
            </div>
          </button>
        {/if}
      {/if}

      {#if user && user.username !== subject.username && subject.pubkey}
        <a
          href={`/${user.username}/messages/${subject.username}`}
          class="contents"
        >
          <button
            class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex w-60 grow"
          >
            <div class="mx-auto flex">
              <Icon icon="message" style="w-8 mr-2 my-auto" />
              <div class="mt-1 my-auto">{$t("user.message")}</div>
            </div>
          </button>
        </a>
      {/if}

      {#if !subject.anon && subject.username !== user?.username && !subject.hidepay}
        <a
          href={user
            ? `/pay/${subject.username}`
            : `/${subject.username}/receive`}
          class="contents"
          id="payButton"
        >
          <button
            class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex w-60 grow"
          >
            <div class="mx-auto flex">
              <Icon icon="send" style="w-8 mr-2" />
              <div class="mt-1">{$t("user.pay")}</div>
            </div>
          </button>
        </a>
      {/if}

      {#if user.username !== subject.username}
        <button
          type="button"
          on:click={toggleDetails}
          class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex justify-center w-full"
        >
          <Icon icon="profile" style="w-8 mr-2" />
          <div class="mt-1">{$t("user.info")}</div>
        </button>
      {/if}

      {#if user?.admin && user.username !== subject.username}
        <form class="w-full flex" on:submit|preventDefault={reset}>
          <input placeholder="Password reset" bind:value={password} />
          <button
            type="submit"
            class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex w-60"
          >
            <div class="mx-auto flex">
              <Icon icon="clock" style="mr-2 my-auto w-8" />
              <div class="mt-1 my-auto">Reset</div>
            </div>
          </button>
        </form>
      {/if}
    </div>
    {#if showDetails}
      <div class="text-xl space-y-5">
        <div>
          <div class="font-bold">{$t("user.profilePage")}</div>
          <div class="flex gap-4">
            <div class="break-all grow text-secondary">
              {profile}
            </div>
            <div class="flex mb-auto gap-1">
              <button class="my-auto" on:click={() => copy(profile)}
                ><Icon icon="copy" style="max-w-max w-8 min-w-[32px]" /></button
              >
              <a href={`/qr/${encodeURIComponent(profile)}`} class="my-auto">
                <Icon icon="qr" style="invert max-w-max min-w-[32px]" />
              </a>
            </div>
          </div>
        </div>
        <div>
          <div class="font-bold">{$t("user.lightningAddress")}</div>
          <div class="flex gap-4">
            <div class="break-all grow text-secondary">
              {lnaddr}
            </div>
            <div class="flex mb-auto gap-1">
              <button class="my-auto" on:click={() => copy(lnaddr)}
                ><Icon icon="copy" style="max-w-max w-8 min-w-[32px]" /></button
              >
              <a href={`/qr/${encodeURIComponent(lnaddr)}`} class="my-auto">
                <Icon icon="qr" style="invert max-w-max min-w-[32px]" />
              </a>
            </div>
          </div>
        </div>
        <div>
          <div class="font-bold">{$t("user.nostrPubkey")}</div>
          <div class="flex gap-4">
            <div class="break-all grow text-secondary">
              {npub}
            </div>
            <div class="flex my-auto gap-1">
              <button class="my-auto" on:click={() => copy(npub)}
                ><Icon icon="copy" style="max-w-max w-8 min-w-[32px]" /></button
              >
              <a href={`/qr/${encodeURIComponent(npub)}`} class="my-auto">
                <Icon icon="qr" style="invert max-w-max min-w-[32px]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <div class="w-full">
    <div class="mx-auto space-y-5 lg:max-w-xl lg:pl-10 xl:max-w-2xl lg:pl-10">
      <slot />
    </div>
  </div>
</div>

{#if currency}
  <div
    class="flex fixed w-full px-4 bg-white py-2 pb-3 bottom-0 bg-opacity-90 tabular-nums"
  >
    <div class="text-secondary flex mr-auto">
      <div class="flex mr-1">
        <div class="my-auto mr-1">1</div>
        <img src="/images/bitcoin.svg" class="w-5 my-auto" alt="Bitcoin" />
      </div>
      <div>= {f(rates[currency], currency)}</div>
    </div>
    <div class="text-secondary flex ml-auto">
      <div class="flex">
        <div class="mr-1">⚡️{s((1 * sats) / rates[currency])} =</div>
        <div>{f(1, currency)}</div>
      </div>
    </div>
  </div>
{/if}
