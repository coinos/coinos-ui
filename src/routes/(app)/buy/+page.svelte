<script>
  import { enhance } from "$app/forms";
	import { PUBLIC_ONRAMPER } from '$env/static/public';
  import Icon from "$comp/Icon.svelte";
  import Lock from "$comp/Lock.svelte";
  import Card from "$comp/Card.svelte";
  import Calendar from "$comp/Calendar.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { f } from "$lib/utils";

  export let data, form;

  let { username, currency } = data.user;
  let loading;

  let amount, n, d, cvc;
</script>

<div class="container px-4 max-w-xl mx-auto mt-10 space-y-5">
  <div class="w-full flex">
    <a href="/" class="mx-auto">
      <Icon icon="logo" />
    </a>
  </div>

	<div class="pt-10">
		<div class="flex w-full justify-center">Your bitcoin address</div>
		<div class="flex w-full justify-center font-bold">
			<div>
				{address}
			</div>
		</div>
		<button class="flex mx-auto mt-5" on:click={() => copy(address)}
			><Icon icon="copy" style="w-10 max-w-none" />
			<div class="my-auto">Copy</div></button
		>
	</div>

	<div class="flex justify-center items-center">
		<div class="shadow-xl rounded-3xl px-10 pt-5 pb-10 space-y-5 w-full mx-5">
			<iframe
				style="border-radius: 4px; border: 1px solid #58585f; margin: auto;max-width: 420px"
				src={`https://buy.onramper.com/?apiKey=${PUBLIC_ONRAMPER}`}
				height="630px"
				width="420px"
				title="Onramper widget"
				allow="accelerometer; autoplay; camera; gyroscope; payment"
			/>
		</div>
	</div>
</div>
