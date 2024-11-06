<script>
  import { invalidate } from "$app/navigation";
  import { browser } from "$app/environment";
  import { hexToUint8Array } from "uint8array-extras";
  import { copy, f, get, post, s, sats, success, fail, si } from "$lib/utils";
  import { t } from "$lib/translations";
  import { sign, send } from "$lib/nostr";
  import { bech32m } from "@scure/base";
  import { page } from "$app/stores";

  export let data;

  let { encode, toWords } = bech32m;

  let {
    events,
    user,
    subject,
    src,
    rates,
    text,
    follows,
    followers,
    followList,
  } = data;
  let { currency, npub, username: n, display } = subject;

  $: refresh(data);
  let refresh = (data) => {
    ({
      events,
      user,
      subject,
      src,
      rates,
      text,
      follows,
      followers,
      followList,
    } = data);
    ({ currency, npub, username: n, display } = subject);
  };

  $: stripped = n.replace(/\s/g, "");
  $: username = n.length > 60 ? n.substr(0, 6) : display || stripped;
  $: lnaddr = subject?.anon
    ? subject.lud16 || undefined
    : `${stripped}@${$page.url.host}`;
  $: profile = `${$page.url.host}/${subject.anon ? npub : stripped}`;

  let list = [];
  $: followList.then((l) => (list = l));
  let follow = async () => {
    list = [...list, subject.pubkey];
    let tags = await get(
      `/api/${user.pubkey}/follows?pubkeysOnly=true&nocache=true`,
    );
    tags.push(["p", subject.pubkey]);
    await update(tags);
    invalidate("app:user");
  };

  let unfollow = async () => {
    list.splice(
      list.findIndex((t) => t[1] === subject.pubkey),
      1,
    );
    list = list;
    let tags = await get(
      `/api/${user.pubkey}/follows?pubkeysOnly=true&nocache=true`,
    );
    tags.splice(
      tags.findIndex((t) => t[1] === subject.pubkey),
      1,
    );
    await update(tags);
  };

  let update = async (tags) => {
    if (!browser) return;

    let event = {
      pubkey: user.pubkey,
      created_at: Math.floor(Date.now() / 1000),
      kind: 3,
      content: "",
      tags,
    };

    try {
      await sign({ event, user });
      await send(event);
    } catch (e) {
      console.log(e);
    }
  };

  $: following = list.some((t) => t.includes(subject.pubkey));

  let showBio;
  let toggleBio = () => (showBio = !showBio);

  let showDetails;
  let toggleDetails = () => (showDetails = !showDetails);

  let password;

  let reset = async () => {
    try {
      await post(`/reset`, { username: n, password });
      success("Password reset");
    } catch (e) {
      fail(e.message);
    }
  };
</script>

<div class="container mx-auto w-full px-4 flex flex-wrap lg:flex-nowrap">
  <div class="hidden lg:block lg:w-[280px] xl:w-[360px]" />
  <div
    class="w-full lg:w-[280px] xl:w-[360px] lg:absolute space-y-2 left-20 mx-auto"
  >
    <button
      type="button"
      on:click={toggleDetails}
      class="flex text-3xl font-bold text-center mx-auto justify-center gap-2"
    >
      <div class="my-auto break-words">{display || username}</div>
      <iconify-icon icon="ph:qr-code-bold" width="32" />
    </button>

    {#if subject.address || subject.about}
      <div
        class="text-secondary mx-auto text-center lg:mx-0 break-words space-y-1"
        class:line-clamp-2={!showBio}
        on:click={toggleBio}
        on:keydown={toggleBio}
      >
        <div>
          {subject.address || subject.about}
        </div>

        {#if subject.website}
          <div>
            <a href={subject.website} class="underline">{subject.website}</a>
          </div>
        {/if}
      </div>
    {/if}

    <div>
      <div class="flex justify-center gap-2">
        <a
          href={`/${subject.pubkey}/follows`}
          data-sveltekit-preload-data="tap"
          rel="nofollow"
          ><b>{si(follows)}</b>
          <span class="text-secondary">{$t("user.following")}</span></a
        >
        <a
          href={`/${subject.pubkey}/followers`}
          data-sveltekit-preload-data="tap"
          rel="nofollow"
          ><b>{si(followers)}</b>
          <span class="text-secondary">{$t("user.followers")}</span></a
        >
      </div>
    </div>

    {#if showDetails}
      <div class="space-y-5 pb-20">
        {#if lnaddr}
          <div>
            <div class="text-secondary">{$t("user.lightningAddress")}</div>
            <div class="flex gap-4">
              <div class="break-all grow text-xl">
                {lnaddr}
              </div>
              <div class="flex mb-auto gap-1">
                <button class="my-auto" on:click={() => copy(lnaddr)}
                  ><iconify-icon icon="ph:copy-bold" width="32" /></button
                >
                <a href={`/qr/${encodeURIComponent(lnaddr)}`} class="my-auto">
                  <iconify-icon icon="ph:qr-code-bold" width="32" />
                </a>
              </div>
            </div>
          </div>
        {/if}
        <div>
          <div class="text-secondary">{$t("user.url")}</div>
          <div class="flex gap-4">
            <div class="break-all grow text-xl">
              {profile}
            </div>
            <div class="flex mb-auto gap-1">
              <button class="my-auto" on:click={() => copy(profile)}
                ><iconify-icon icon="ph:copy-bold" width="32" /></button
              >
              <a
                href={`/qr/${encodeURIComponent(
                  `${$page.url.protocol}//${profile}`,
                )}`}
                class="my-auto"
              >
                <iconify-icon icon="ph:qr-code-bold" width="32" />
              </a>
            </div>
          </div>
        </div>
        <div>
          <div class="text-secondary">{$t("user.nostrPubkey")}</div>
          <div class="flex gap-4">
            <div class="break-all grow text-xl">
              {npub}
            </div>
            <div class="flex my-auto gap-1">
              <button class="my-auto" on:click={() => copy(npub)}
                ><iconify-icon icon="ph:copy-bold" width="32" /></button
              >
              <a href={`/qr/${encodeURIComponent(npub)}`} class="my-auto">
                <iconify-icon icon="ph:qr-code-bold" width="32" />
              </a>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <div class="flex flex-wrap gap-2 w-full text-lg">
      {#if user && user.username !== subject.username && subject.pubkey}
        {#if following}
          <button class="btn" on:click={unfollow}>
            <iconify-icon icon="ph:user-bold" width="32" />
            <div class="my-auto">{$t("user.unfollow")}</div>
          </button>
        {:else}
          <button class="btn" on:click={follow}>
            <iconify-icon icon="ph:user-bold" width="32" />
            <div class="my-auto">{$t("user.follow")}</div>
          </button>
        {/if}
      {/if}

      <!-- {#if user &#38;&#38; user.username !== subject.username &#38;&#38; subject.pubkey} -->
      <!--   <a href={`/messages/${subject.username}`} class="contents"> -->
      <!--     <button -->
      <!--       class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex w-60 grow" -->
      <!--     > -->
      <!--       <div class="mx-auto flex"> -->
      <!--         <Icon icon="message" style="w-8 mr-2 my-auto" /> -->
      <!--         <div class="mt-1 my-auto">{$t("user.message")}</div> -->
      <!--       </div> -->
      <!--     </button> -->
      <!--   </a> -->
      <!-- {/if} -->

      {#if user?.admin && user.username !== subject.username}
        <form class="w-full flex" on:submit|preventDefault={reset}>
          <input placeholder="Password reset" bind:value={password} />
          <button
            type="submit"
            class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex w-60"
          >
            <div class="mx-auto flex">
              <iconify-icon icon="ph:clock" width="32" />
            </div>
          </button>
        </form>
      {/if}
    </div>
  </div>

  <div class="w-full">
    <div
      class="mx-auto space-y-5 lg:max-w-xl xl:max-w-2xl lg:pl-10 mt-5 lg:mt-0"
    >
      <slot />
    </div>
  </div>
</div>

{#if currency}
  <div
    class="flex fixed w-full px-4 bg-base-100 py-2 pb-3 bottom-0 bg-opacity-90 tabular-nums"
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
