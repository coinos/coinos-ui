<script>
  import { page } from "$app/stores";
  import { fly } from "svelte/transition";
  import { enhance } from "$app/forms";
  import { tick } from "svelte";
  import { browser } from "$app/environment";
  import { t } from "$lib/translations";
  import AppHeader from "$comp/AppHeader.svelte";
  import Avatar from "$comp/Avatar.svelte";
  import Icon from "$comp/Icon.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { back, fail } from "$lib/utils";

  export let data;
  export let form;
  data.subject = data.user;

  let { contacts } = data;
  let w;

  let el, textarea, text;
  let placeholder = $t("user.send.placeholder");

  $: $page && setTimeout(() => w > 800 && textarea?.focus(), 0);
  let keypress = (e) => e.key === "Enter" && (e.preventDefault() || el.click());

  let paste = async () => {
    text = await navigator.clipboard.readText();
  };
</script>

<svelte:window bind:innerWidth={w} />

<AppHeader {data} />
<div class="container px-4 max-w-xl mx-auto space-y-7 mt-24">
  <h1 class="px-3 md:px-0 text-center text-4xl md:text-5xl font-semibold font-bebasNeue tracking-[0.2rem]">
    {$t("payments.send")}
  </h1>

  <form method="POST" use:enhance>
    {#if form?.error}
      <div class="mb-5">
        <div class="text-red-600">
          {$t("error.unrecognizedInput")}
        </div>
      </div>
    {/if}

    <div class="mb-4">
      <input type="hidden" name="text" bind:value={text} />

      <textarea
        {placeholder}
        on:keypress={keypress}
        class="w-full p-4 border border-stone-400 focus:outline-none focus:ring-2 hover:ring-2 ring-stone-900 dark:ring-white transition-all duration-500 rounded-xl h-48 dark:bg-stone-800 placeholder:text-stone-300"
        bind:value={text}
        bind:this={textarea}
      />
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <a
        href={`/qr/${encodeURIComponent(text)}`}
        class:invisible={!text?.length}
      >
        <button
          type="button"
          class="flex border dark:border-white rounded-full px-6 py-2 font-bold hover:opacity-80 mr-1 w-full"
        >
          <Icon icon="qr" style="mr-2 w-6 my-auto invert dark:invert-0" />
          <div class="my-auto">{$t("user.send.makeQR")}</div>
        </button>
      </a>

      <a href="/scan" class="w-full">
        <button
          type="button"
          class="flex border dark:border-white rounded-full px-6 py-2 font-bold hover:opacity-80 mr-1 w-full"
        >
          <Icon icon="camera" style="mr-2 w-6 my-auto dark:invert" />
          <div class="my-auto">{$t("user.send.scan")}</div>
        </button>
      </a>

      <button
        type="button"
        class="flex border dark:border-white rounded-full px-6 py-2 font-bold hover:opacity-80 "
        on:click={paste}
      >
        <Icon icon="paste" style="mr-2 w-6 my-auto dark:invert" />
        <div class="my-auto">{$t("user.send.paste")}</div>
      </button>

      <button
        bind:this={el}
        type="submit"
        class="{!text
          ? 'opacity-50'
          : 'opacity-100 hover:opacity-80'} bg-black dark:bg-swapee-purple text-white border rounded-full px-6 py-2 font-bold"
      >
        {$t("user.send.next")}
      </button>
    </div>
  </form>

  {#if contacts.length}
    <div class="space-y-5">
      <h1 class="px-3 md:px-0 text-xl font-semibold mt-10">
        {$t("user.send.contacts")}
      </h1>
      <div>
        <!-- <a href={`/send/$aaaa`}>
          <div
            class="border-b p-2 last:border-b-0 hover:bg-gray-200 dark:hover:bg-swapee-purple transition-all duration-200 ease-out rounded-2xl hover:ring-1 ring-swapee-purple"
          >
            <div class="flex">
              <div>
                <div class="flex">
                  <Avatar  size={20} disabled={true} />
                  <div class="my-auto text-left">
                    <p class="ml-1 text-lg break-words">aaa aasa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a> -->         
        {#each contacts as c}
          <a href={`/send/${c.username}`}>
            <div
            class="border-b p-2 last:border-b-0 hover:bg-gray-200 dark:hover:bg-stone-800 transition-all duration-200 ease-out rounded-2xl"
            >
              <div class="flex">
                <div>
                  <div class="flex">
                    <Avatar user={c} size={20} disabled={true} />
                    <div class="my-auto text-left">
                      <p class="ml-1 text-lg break-words">{c.username}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
