<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Icon, PageNotFound } from '$comp';
	import { copy } from '$lib/utils';
	import { t } from '$lib/translations';
	export let data;

	let { user, subject, src, text } = data;
	let followed = false;
</script>

<div class="container px-4 flex flex-wrap sm:flex-nowrap mb-4">
	<div class="w-full sm:w-[340px] pt-20 space-y-5 mr-4">
		<h1 class="text-3xl font-bold text-center sm:text-left">{subject.username}</h1>

		<div class="text-secondary w-64">
			{subject.address && subject.address !== 'null' ? subject.address : ''}
		</div>

		{#if user?.username !== subject.username}
			<div>
				<a href={`/${subject.username}/receive`}>
					<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full mb-2">
						Pay now
					</button>
				</a>

				{#if user}
					<a href={`/${subject.username}/request`}>
						<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full mb-2"
							>Ask to pay</button
						>
					</a>
				{/if}

				<a href={`/${subject.username}/address`}>
					<button class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full mb-2">
						Bitcoin address
					</button>
				</a>
			</div>
		{/if}
	</div>

	<div class="space-y-5 mt-5 sm:mt-20 mx-auto max-w-lg">
		<img
			{src}
			class="w-[300px] mx-auto"
			on:click={() => copy(text)}
		/>

		<div class="bg-primary font-semibold rounded-xl text-sm p-3 flex">
			<div class="my-auto font-semibold text-lg w-full text-center">{text}</div>
			<button class="ml-auto hover:opacity-80" on:click={() => copy(text)}>
				<Icon icon="copy" />
			</button>
		</div>

		<p class="text-secondary mb-1">
			This <a href="https://lightningaddress.com" class="underline" target="_blank" rel="noreferrer"
				>lightning address</a
			> is like an email for bitcoin. You can publish it on your website or business cards and use it multiple times.
		</p>
	</div>


</div>
