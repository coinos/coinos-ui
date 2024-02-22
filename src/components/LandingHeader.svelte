<script>
  import { goto } from "$app/navigation";
  import { scroll } from "$lib/utils";
  import Icon from "$comp/Icon.svelte";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";

  export let howItWorks;
  export let faq;
  export let about;
  export let user;

  let showMobileMenu = false;
  let header;
  const mobileMenuButtonClick = (section) => {
    showMobileMenu = false;
    scroll(section);
  };
</script>

<header
  class="w-full container px-10 lg:px-40 md:pb-5 pt-5 mx-auto fixed md:sticky z-10 top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
  bind:this={header}
>
	<nav class="reltive flex flex-wrap justify-between items-center max-md:pb-4">
		<div class="flex justify-start md:justify-center items-center md:space-x-10">
			<a href="/" on:click={() => scroll(header)} class="">
				<img src="images/logo.png" class="max-w-[140px] dark:hidden" alt="swapee logo" />
        <img src="images/logo-white.png" class="max-w-[140px] hidden dark:inline-block" alt="swapee logo" />
			</a>
		</div>

    <!-- desktop nav -->
    <div
      class="hidden space-x-10 md:flex flex-wrap justify-center items-center font-bold"
    >
      {#if $page.url.pathname === "/"}
        <button class="hover:opacity-80" on:click={() => scroll(howItWorks)}
          >{$t("howItWorks.header")}</button
        >
        <button class="hover:opacity-80" on:click={() => scroll(faq)}
          >{$t("faq.header")}</button
        >
        <button class="hover:opacity-80" on:click={() => scroll(about)}
          >{$t("about.header")}</button
        >
      {/if}
      {#if user}
        <button
          class="dark:!bg-black dark:!text-white border-black dark:!border-white !border-2 !font-bold px-6 py-2 rounded-full" 
          on:click={() => goto(`/${user.username}`)}
         >Home
        </button>
        <button
          class="bg-black dark:!bg-white dark:!text-black !text-white border-2 border-black rounded-full px-6 py-2 font-bold"
          on:click={() => goto("/logout")}
        >
          {$t("nav.signOut")}
        </button>
      {:else}
        <button
          class="dark:!bg-black dark:!text-white border-black dark:!border-white !border-2 !font-bold px-6 py-2 rounded-full hover:opacity-80"
          on:click={() => goto("/register")}
          >{$t("nav.startInSeconds")}
        </button>
        <button
          class="bg-black dark:!bg-white dark:!text-black !text-white border-2 border-black rounded-full px-6 py-2 font-bold hover:opacity-80"
          on:click={() => goto("/login")}
        >
          {$t("nav.signIn")}
        </button>
      {/if}
    </div>

    <!-- mobile nav -->
    <button
      class="scale-125 z-50 md:hidden"
      on:click={() => (showMobileMenu = !showMobileMenu)}
      ><Icon icon={!showMobileMenu ? "menu" : "close"} style="dark:invert" />
    </button>

    <div
      class="container w-full px-10 md:hidden absolute top-0 {showMobileMenu
        ? 'right-0'
        : 'right-[-100%]'} transition-all ease-in-out duration-300 h-[100vh] w-full bg-white dark:bg-black"
    >
      <div class="space-y-8 mt-24 font-bold text-xl">
        <button on:click={() => mobileMenuButtonClick(howItWorks)} class="block dark:!text-gray-200"
          >{$t("howItWorks.header")}</button
        >
        <button on:click={() => mobileMenuButtonClick(faq)} class="block dark:!text-gray-200"
          >{$t("faq.header")}</button
        >
        <button on:click={() => mobileMenuButtonClick(about)} class="block dark:!text-gray-200"
          >{$t("about.header")}</button
        >
        {#if !user}
          <button
            class="dark:!bg-black dark:!text-white border-black dark:!border-white !border-2 !font-bold px-6 py-2 rounded-full w-full"
            on:click={() => goto("/register")}
            >{$t("nav.startInSeconds")}
          </button>
          <button
            class="bg-black dark:!bg-white dark:!text-black !text-white border-2 border-black rounded-full px-6 py-2 font-bold w-full"
            on:click={() => goto("/login")}
          >
            {$t("nav.signIn")}
          </button>
        {:else}
          <button
            class="dark:!bg-black dark:!text-white border-black dark:!border-white !border-2 !font-bold px-6 py-2 rounded-full"
            on:click={() => goto(`/${user.username}`)}
            >{$t("nav.account")}
          </button>
          <button
            class="bg-black dark:!bg-white dark:!text-black !text-white border-2 border-black rounded-full px-6 py-2 font-bold w-full"
            on:click={() => goto("/logout")}
          >
            {$t("nav.signOut")}
          </button>
        {/if}
      </div>
    </div>
  </nav>
</header>

<style>
  @import '../../static/style.css';
	.z {
		z-index: 100;
	}

	button {
		font-size: 14px;
		font-weight: 600;
    color: black;
		text-transform: uppercase;
		font-family: 'Work Sans', sans-serif;
		position: relative;
		transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
			border-color 0.15s ease-in-out;
	}

button::after{
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: #7005f38a;
    transform: translateX(-50%);
    -webkit-transform: translateX(-50%);
    -moz-transform: translateX(-50%);
    -ms-transform: translateX(-50%);
    -o-transform: translateX(-50%);
    transition: var(--transition_3s);
    -webkit-transition: var(--transition_3s);
    -moz-transition: var(--transition_3s);
    -ms-transition: var(--transition_3s);
    -o-transition: var(--transition_3s);
}
</style>
