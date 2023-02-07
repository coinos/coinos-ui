<script>
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { browser } from '$app/environment';
	import { t } from '$lib/translations';
	import { AppHeader, Avatar, Icon, Spinner } from '$comp';
	import { back, fail } from '$lib/utils';
	import { format, parseISO } from 'date-fns';

	export let data;
	export let form;
	data.subject = data.user;

	let { contacts } = data;
	let w;

	let el, textarea, text;
	let placeholder = $t('user.send.placeholder');

	$: $page && setTimeout(() => w > 800 && textarea?.focus(), 0);
	let keypress = (e) => e.key === 'Enter' && (e.preventDefault() || el.click());

	let paste = async () => {
		text = await navigator.clipboard.readText();
	};
</script>

<svelte:window bind:innerWidth={w} />

<AppHeader {data} />
<div class="container px-4 max-w-lg mx-auto space-y-5 mt-20">
	<h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
		{$t('payments.send')}
	</h1>

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
					<div class="my-auto">{$t('user.send.scan')}</div>
				</button>
			</a>

			<button
				type="button"
				class="flex border rounded-full px-6 py-2 font-bold hover:opacity-80 mr-1"
				on:click={paste}
			>
				<Icon icon="paste" style="mr-2 w-6 my-auto" />
				<div class="my-auto">{$t('user.send.paste')}</div>
			</button>

			<button
				bind:this={el}
				type="submit"
				class="{!text
					? 'opacity-50'
					: 'opacity-100 hover:opacity-80'} bg-black text-white border rounded-full px-6 py-2 font-bold"
			>
				{$t('user.send.next')}
			</button>
		</div>
	</form>

	{#if contacts.length}
		<div class="space-y-5">
			<h1 class="px-3 md:px-0 text-xl font-semibold mt-10">{$t('user.send.contacts')}</h1>
			<div>
				{#each contacts as c}
          <a href={`/send/${c.username}`}>
						<div class="border-b p-2 last:border-b-0 hover:bg-gray-100">
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
