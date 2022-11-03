<script>
	import { enhance } from '$app/forms';
	import { Icon } from '$comp';
	import { back } from '$lib/utils';

  export let form;
</script>

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold mb-8">Request an invoice</h1>
{#if form}
  {JSON.stringify(form)}
{/if}

<div class="container max-w-lg px-4">
	<form method="POST" use:enhance>
		<textarea name="note" placeholder="Note" class="w-full p-4 border rounded-xl h-48" />

		<button type="submit" class="bg-black text-white border rounded-full px-6 py-2 font-bold">
			Submit
		</button>
	</form>
</div>
