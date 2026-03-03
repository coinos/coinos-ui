<script lang="ts">
  import PhFadersBold from "virtual:icons/ph/faders-bold";
  import PhChatBold from "virtual:icons/ph/chat-bold";
  import PhNoteBold from "virtual:icons/ph/note-bold";
  import PhUserBold from "virtual:icons/ph/user-bold";
  import PhClock from "virtual:icons/ph/clock";
  import PhLightningFill from "virtual:icons/ph/lightning-fill";
  import { f, loc, post, s, sats, success, fail } from "$lib/utils";

  let { data, children } = $props();

  let { rates, user, subject } = $derived(data);
  let rate = $derived(rates[subject.currency]);
  let { events, src, text } = $derived(data as any);
  let satsPerCurrency = $derived((1 * sats) / rate);

  let { currency, username: n, display } = $derived(subject);
  let locale = $derived(loc(user));

  let showBio = $state();
  let toggleBio = () => (showBio = !showBio);

  let password = $state();

  let reset = async (e) => {
    e.preventDefault();
    try {
      await post(`/reset`, { username: n, password });
      success("Password reset");
    } catch (e: any) {
      fail(e.message);
    }
  };

  let stripped = $derived(n.replace(/\s/g, ""));
  let username = $derived(n.length > 60 ? n.substr(0, 6) : display || stripped);
</script>

<div class="container mx-auto w-full px-4 flex flex-wrap lg:flex-nowrap">
  <div class="hidden lg:block lg:w-[280px] xl:w-[360px]"></div>
  <div class="w-full lg:w-[280px] xl:w-[360px] lg:absolute space-y-2 left-20 mx-auto">
    <div class="flex text-3xl font-bold text-center mx-auto justify-center gap-3 items-center">
      <div class="break-words">{display || username}</div>
      {#if subject.id === user?.id}
        <a href="/settings/profile" class="flex items-center" aria-label="Profile settings">
          <PhFadersBold width="32" />
        </a>
      {:else}
        <a href="/messages/{subject.pubkey}" aria-label="Direct Message">
          <PhChatBold width="32" />
        </a>
      {/if}
      <!-- <a href={`/${subject.pubkey}/notes`}> -->
      <!--   <PhNoteBold width="32" /> -->
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
        <div>{subject.about}</div>

        {#if subject.website}
          <div>
            <a href={subject.website} class="underline">{subject.website}</a>
          </div>
        {/if}
      </div>
    {/if}

    <div class="flex flex-wrap gap-2 w-full text-lg">
      <!-- {#if user &#38;&#38; user.username !== subject.username &#38;&#38; subject.pubkey} -->
      <!--   {#if following} -->
      <!--     <button class="btn" onclick={unfollow}> -->
      <!--       <PhUserBold width="32" /> -->
      <!--       <div class="my-auto">{$t("user.unfollow")}</div> -->
      <!--     </button> -->
      <!--   {:else} -->
      <!--     <button class="btn" onclick={follow}> -->
      <!--       <PhUserBold width="32" /> -->
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
              <PhClock width="32" />
            </div>
          </button>
        </form>
      {/if}
    </div>
  </div>

  <div class="w-full">
    <div class="mx-auto space-y-5 lg:max-w-xl xl:max-w-2xl lg:pl-10 mt-5 lg:mt-0 pb-12">
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
    <div class="text-secondary flex ml-auto items-center gap-1">
      {#if satsPerCurrency >= 1}
        <div>{f(1, currency, locale)} &#61;</div>
        <div class="flex items-center">
          <PhLightningFill width="20" class="text-yellow-300" />
          {s(satsPerCurrency)}
        </div>
      {:else}
        <div class="flex items-center">
          <PhLightningFill width="20" class="text-yellow-300" />
          1
        </div>
        <div>&#61; {f(1 / satsPerCurrency, currency, locale)}</div>
      {/if}
    </div>
  </div>
{/if}
