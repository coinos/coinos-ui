<script>
  import { enhance } from "$app/forms";
  import { PUBLIC_ONRAMPER } from "$env/static/public";
  import Icon from "$comp/Icon.svelte";
  import Lock from "$comp/Lock.svelte";
  import Card from "$comp/Card.svelte";
  import Calendar from "$comp/Calendar.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { f } from "$lib/utils";

  export let data, form;

  let { address } = data;
  let { username, currency } = data.user;
  let loading;

  let amount, n, d, cvc;
</script>

<div class="container px-4 max-w-xl mx-auto">
  <!-- <div class="w-full flex">
    <a href="/" class="mx-auto">
	  	<img src="images/logo.png" alt="" class="dark:hidden block" />
		<img src="images/logo-white.png" alt="" class="hidden dark:block" />
    </a>
  </div> -->
  <h1
    class="px-3 md:px-0 text-center text-4xl md:text-5xl font-semibold font-bebasNeue tracking-[0.2rem] mb-4"
  >
    Buy
  </h1>

  <div class="mb-6">
    <div class="flex w-full justify-center">Your bitcoin address</div>
    <div class="flex w-full justify-center font-bold">
      <div>
        {address}
        <!-- fs5werw748272asfds584927jhjk3458927sdfs38972 -->
      </div>
    </div>
    <!-- on:click={() => copy(address)} -->
    <button class="flex mx-auto mt-5 gap-2" on:click={() => copy(address)}>
      <Icon icon="copy" style="w-10 max-w-none dark:invert" />
      <div class="my-auto">Copy</div>
    </button>
  </div>

  <div class="flex justify-center items-center">
    <div class="">
      <iframe
        style="border-radius: 10px; border: 1px solid #58585f; margin: auto;max-width: 420px;"
        class="dark:hidden"
        src={`https://buy.onramper.com/?apiKey=${PUBLIC_ONRAMPER}&themeName=light&containerColor=ffffff&primaryColor=7105f3ff&secondaryColor=ffffff&cardColor=f6f7f9&primaryTextColor=141519&secondaryTextColor=6b6f80&borderRadius=2&wgBorderRadius=1`}
        height="630px"
        width="420px"
        title="Onramper widget"
        allow="accelerometer; autoplay; camera; gyroscope; payment"
      />
      <iframe
        style="border-radius: 10px; border: 1px solid #58585f; margin: auto;max-width: 420px;"
        class="hidden dark:block"
        src={`https://buy.onramper.com/?apiKey=${PUBLIC_ONRAMPER}&themeName=dark&containerColor=292524ff&primaryColor=7105f3ff&secondaryColor=292524ff&cardColor=44403cff&primaryTextColor=ffffff&secondaryTextColor=ffffffff&borderRadius=2&wgBorderRadius=1`}
        height="630px"
        width="420px"
        title="Onramper widget"
        allow="accelerometer; autoplay; camera; gyroscope; payment"
      />
    </div>
  </div>
</div>

<!-- src/routes/(app)/buy -->
