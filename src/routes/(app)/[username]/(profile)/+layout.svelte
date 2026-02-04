<script>
  import {
    copy,
    f,
    loc,
    post,
    s,
    sats,
    success,
    fail,
  } from "$lib/utils";
  import { t } from "$lib/translations";
  import { bech32 } from "@scure/base";
  import { page } from "$app/stores";
  import { PUBLIC_DOMAIN } from "$env/static/public";

  let { data, children } = $props();

  let { encode, toWords } = bech32;

  let { events, rate, user, subject, src, text } = $derived(data);

  let { currency, npub, username: n, display } = $derived(subject);
  let locale = $derived(loc(user));


  let showBio = $state();
  let toggleBio = () => (showBio = !showBio);

  let showDetails = $state();
  let toggleDetails = () => (showDetails = !showDetails);

  let password = $state();

  let reset = async (e) => {
    e.preventDefault();
    try {
      await post(`/reset`, { username: n, password });
      success("Password reset");
    } catch (e) {
      fail(e.message);
    }
  };

  let stripped = $derived(n.replace(/\s/g, ""));
  let username = $derived(n.length > 60 ? n.substr(0, 6) : display || stripped);
  let lnaddr = $derived(
    subject?.anon
      ? subject.lud16 || undefined
      : `${stripped}@${$page.url.host}`,
  );
  let profile = $derived(`${$page.url.host}/${subject.anon ? npub : stripped}`);
  let lnurl = $derived(
    encode(
      "lnurl",
      toWords(
        new TextEncoder().encode(
          `https://${PUBLIC_DOMAIN}/p/${subject.anon ? npub : stripped}`,
        ),
      ),
      20000,
    ),
  );
</script>

<div class="container mx-auto w-full px-4 flex flex-wrap lg:flex-nowrap">
  <div class="hidden lg:block lg:w-[280px] xl:w-[360px]"></div>
  <div
    class="w-full lg:w-[280px] xl:w-[360px] lg:absolute space-y-2 left-20 mx-auto"
  >
    <div
      class="flex text-3xl font-bold text-center mx-auto justify-center gap-1 items-center"
    >
      <button class="flex gap-1 items-center" onclick={toggleDetails}>
        <div class="break-words">{display || username}</div>
        <iconify-icon noobserver icon="ph:list-bold" width="32"></iconify-icon>
      </button>
      {#if subject.id === user?.id}
        <a href="/settings/profile" class="btn contents" aria-label="Edit profile">
          <iconify-icon noobserver icon="ph:pencil-bold" width="32"
          ></iconify-icon>
        </a>
      {/if}
      <!-- <a href={`/${subject.pubkey}/notes`}> -->
      <!--   <iconify-icon noobserver icon="ph:note-bold" width="32"></iconify-icon> -->
      <!-- </a> -->
    </div>

    {#if subject.about}
      <div
        class="text-secondary mx-auto text-center lg:mx-0 break-words space-y-1"
        class:line-clamp-2={!showBio}
        onclick={toggleBio}
        onkeydown={(e) => (e.key === "Enter" || e.key === " ") && toggleBio()}
        role="button"
        tabindex="0"
      >
        <div>
          {subject.about}
        </div>

        {#if subject.website}
          <div>
            <a href={subject.website} class="underline">{subject.website}</a>
          </div>
        {/if}
      </div>
    {/if}

    {#if showDetails}
      <div class="space-y-5">
        {#if lnaddr}
          <div>
            <div class="text-secondary">{$t("user.lightningAddress")}</div>
            <div class="flex gap-4">
              <div class="break-all grow text-xl">
                {lnaddr}
              </div>
              <div class="flex mb-auto gap-1">
                <button
                  type="button"
                  class="my-auto"
                  aria-label="Copy lightning address"
                  onclick={() => copy(lnaddr)}
                >
                  ><iconify-icon noobserver icon="ph:copy-bold" width="32"
                  ></iconify-icon></button
                >
                <a
                  href={`/qr/${encodeURIComponent(lnaddr)}`}
                  class="my-auto"
                  aria-label="Show lightning address QR"
                >
                  <iconify-icon noobserver icon="ph:qr-code-bold" width="32"
                  ></iconify-icon>
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
              <button
                type="button"
                class="my-auto"
                aria-label="Copy profile URL"
                onclick={() => copy(profile)}
              >
                ><iconify-icon noobserver icon="ph:copy-bold" width="32"
                ></iconify-icon></button
              >
              <a
                href={`/qr/${encodeURIComponent(
                  `${$page.url.protocol}//${profile}`,
                )}`}
                class="my-auto"
                aria-label="Show profile URL QR"
              >
                <iconify-icon noobserver icon="ph:qr-code-bold" width="32"
                ></iconify-icon>
              </a>
            </div>
          </div>
        </div>
        <div>
          <div class="text-secondary">{$t("user.lnurl")}</div>
          <div class="flex gap-4">
            <div class="break-all grow text-xl">
              {lnurl}
            </div>
            <div class="flex mb-auto gap-1">
              <button
                type="button"
                class="my-auto"
                aria-label="Copy LNURL"
                onclick={() => copy(`lightning:${lnurl}`)}
              >
                ><iconify-icon noobserver icon="ph:copy-bold" width="32"
                ></iconify-icon></button
              >
              <a
                href={`/${n}/accepted/${encodeURIComponent(`lightning:${lnurl}`)}`}
                class="my-auto"
                aria-label="Show LNURL QR"
              >
                <iconify-icon noobserver icon="ph:qr-code-bold" width="32"
                ></iconify-icon>
              </a>
            </div>
          </div>
        </div>
        <!-- <div> -->
        <!--   <div class="text-secondary">{$t("user.nostrPubkey")}</div> -->
        <!--   <div class="flex gap-4"> -->
        <!--     <div class="break-all grow text-xl"> -->
        <!--       {npub} -->
        <!--     </div> -->
        <!--     <div class="flex my-auto gap-1"> -->
        <!--       <button class="my-auto" onclick={() => copy(npub)} -->
        <!--         ><iconify-icon noobserver icon="ph:copy-bold" width="32" -->
        <!--         ></iconify-icon></button -->
        <!--       > -->
        <!--       <a href={`/qr/${encodeURIComponent(npub)}`} class="my-auto"> -->
        <!--         <iconify-icon noobserver icon="ph:qr-code-bold" width="32" -->
        <!--         ></iconify-icon> -->
        <!--       </a> -->
        <!--     </div> -->
        <!--   </div> -->
        <!-- </div> -->
      </div>
    {/if}

    <div class="flex flex-wrap gap-2 w-full text-lg">
      <!-- {#if user &#38;&#38; user.username !== subject.username &#38;&#38; subject.pubkey} -->
      <!--   {#if following} -->
      <!--     <button class="btn" onclick={unfollow}> -->
      <!--       <iconify-icon noobserver icon="ph:user-bold" width="32" -->
      <!--       ></iconify-icon> -->
      <!--       <div class="my-auto">{$t("user.unfollow")}</div> -->
      <!--     </button> -->
      <!--   {:else} -->
      <!--     <button class="btn" onclick={follow}> -->
      <!--       <iconify-icon noobserver icon="ph:user-bold" width="32" -->
      <!--       ></iconify-icon> -->
      <!--       <div class="my-auto">{$t("user.follow")}</div> -->
      <!--     </button> -->
      <!--   {/if} -->
      <!-- {/if} -->

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
        <form class="w-full flex" onsubmit={reset}>
          <input placeholder="Password reset" bind:value={password} />
          <button
            type="submit"
            class="rounded-2xl border py-5 px-6 font-bold hover:opacity-80 flex w-60"
            aria-label="Reset password"
          >
            <div class="mx-auto flex">
              <iconify-icon noobserver icon="ph:clock" width="32"
              ></iconify-icon>
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
      {@render children?.()}
    </div>
  </div>
</div>

{#if currency}
  <div
    class="flex fixed w-full px-4 bg-base-100/90 py-2 pb-3 bottom-0 tabular-nums"
    style="bottom: var(--safe-area-inset-bottom);"
  >
    <div class="text-secondary flex mr-auto">
      <div class="flex mr-1">
        <div class="my-auto mr-1">1</div>
        <img src="/images/bitcoin.svg" class="w-5 my-auto" alt="Bitcoin" />
      </div>
      <div>&#61; {f(rate, currency, locale, 0, 0)}</div>
    </div>
    <div class="text-secondary flex ml-auto">
      <div class="flex items-center">
        <iconify-icon
          noobserver
          icon="ph:lightning-fill"
          class="text-yellow-300"
        ></iconify-icon>
        {s((1 * sats) / rate)} =
        {f(1, currency, locale, 0, 0)}
      </div>
    </div>
  </div>
{/if}
