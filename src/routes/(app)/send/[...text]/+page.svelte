<script>
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { browser } from '$app/environment';
	import { t } from '$lib/translations';
	import { Avatar, Icon, Spinner } from '$comp';
	import { back, failure } from '$lib/utils';
	import { format, parseISO } from 'date-fns';

	export let data;
	export let form;

	let { contacts } = data;
	let w;

	let el, textarea, text;
	let placeholder = 'Paste a bitcoin address, lightning invoice or coinos username';

	$: $page && setTimeout(() => w > 800 && textarea?.focus(), 0);
	let keypress = (e) => e.key === 'Enter' && (e.preventDefault() || el.click());

	let paste = async () => {
		text = await navigator.clipboard.readText();
	};
</script>

<svelte:window bind:innerWidth={w} />

<button class="ml-5 md:ml-20 mt-5 md:mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="container px-4 max-w-lg mx-auto space-y-5 mt-10">
	<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">Send</h1>

	<form method="POST" use:enhance>
		{#if form?.error}
			<div class="text-red-600 text-center" in:fly>
				{form.error}
			</div>
		{/if}
		<div class="mb-2">
			<input type="hidden" name="text" bind:value={text} />

			<textarea
				{placeholder}
				on:keypress={keypress}
				class="w-full p-4 border rounded-xl h-48"
				bind:value={text}
				bind:this={textarea}
			/>
		</div>

		<div class="flex justify-end">
			<a href="/scan">
				<button
					type="button"
					class="flex border rounded-full px-6 py-2 font-bold hover:opacity-80 mr-1"
				>
					<Icon icon="scan" style="mr-2 w-6 my-auto" />
					<div class="my-auto">Scan</div>
				</button>
			</a>

			<button
				type="button"
				class="flex border rounded-full px-6 py-2 font-bold hover:opacity-80 mr-1"
				on:click={paste}
			>
				<Icon icon="paste" style="mr-2 w-6 my-auto" />
				<div class="my-auto">Paste</div>
			</button>

			<button
				bind:this={el}
				type="submit"
				class="{!text
					? 'opacity-50'
					: 'opacity-100 hover:opacity-80'} bg-black text-white border rounded-full px-6 py-2 font-bold"
			>
				Next
			</button>
		</div>
	</form>

	{#if contacts.length}
		<div class="space-y-5">
			<h1 class="px-3 md:px-0 text-xl font-semibold mt-10">Contacts</h1>
			<div>
				{#each contacts as c}
					<div class="border-b p-2 last:border-b-0 hover:bg-gray-100">
						<div class="flex">
							<div>
								<div class="flex">
									<Avatar user={c} size={20} disabled={true} />
									<div class="my-auto text-left">
										<p class="ml-1 text-lg break-words">{c.username}</p>
										<p class="ml-1 text-secondary">
											{format(parseISO(c.last), 'MMM d')}
										</p>
									</div>
								</div>
							</div>
							<div class="flex ml-auto my-auto gap-2">
								<a href={`/${c.username}/request`}>
									<div class="my-auto p-2 border rounded-xl bg-white opacity-50 hover:opacity-100">
										<Icon icon="support" style="w-8" />
									</div>
								</a>
								<a href={`/${c.username}/receive`}>
									<div class="my-auto p-2 border rounded-xl bg-white opacity-50 hover:opacity-100">
										<Icon icon="send" style="w-8" />
									</div>
								</a>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
