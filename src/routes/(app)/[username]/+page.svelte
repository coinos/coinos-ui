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

<div class="container mx-auto w-full px-4 mb-4 flex flex-wrap">
	<div class="w-[240px] pt-20 space-y-5 lg:absolute left-20 mx-auto">
		<h1 class="text-3xl font-bold text-center mx-auto lg:text-left">{subject.username}</h1>

		<div class="text-secondary mx-auto text-center lg:text-left lg:mx-0">
			{subject.address && subject.address !== 'null' ? subject.address : ''}
		</div>

		<div class="flex flex-wrap gap-2 w-full">
			<div class="w-full flex">
				<a href={`/${subject.username}/receive`} class="mx-auto">
					<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-40">
						<div class="mx-auto flex">
							<div style="mr-1">⚡️</div>
							<div>{$t('user.lightning')}</div>
						</div>
					</button>
				</a>
			</div>

			<div class="w-full flex">
				<a href={`/${subject.username}/receive/bitcoin`} class="mx-auto">
					<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-40">
						<div class="mx-auto flex">
							<img src="/images/bitcoin.svg" class="w-5 my-auto mr-1" />
							<div>{$t('user.bitcoin')}</div>
						</div>
					</button>
				</a>
			</div>

			{#if user?.username !== subject.username}
				<div class="w-full flex">
					<a href={`/${subject.username}/request`} class="mx-auto">
						<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-40">
							<div class="mx-auto flex">
								<Icon icon="support" style="mr-1" />
								<div>{$t('user.invoice')}</div>
							</div>
						</button>
					</a>
				</div>
			{/if}
		</div>
	</div>

	<div class="w-full flex">
		<div class="space-y-5 mt-5 lg:pt-20 mx-auto max-w-lg">
			<div class="border-2 rounded-[20%] w-[380px] py-6 mx-auto">
				<img {src} class="mx-auto" on:click={() => copy(text)} alt="Lightning address" />
			</div>

			<div class="bg-primary font-semibold rounded-3xl text-sm p-3 flex">
				<div class="my-auto font-semibold text-lg w-full text-center">{text}</div>
				<button class="ml-auto hover:opacity-80" on:click={() => copy(text)}>
					<Icon icon="copy" />
				</button>
			</div>

			{#if user?.username === subject.username}
				<p class="text-secondary mb-1">
        {$t("user.this")} <a
						href="https://lightningaddress.com"
						class="underline"
						target="_blank"
      rel="noreferrer">{$t("user.lightningAddress")}</a
    > {$t("user.likeAnEmail")}
					
				</p>
			{/if}
		</div>
	</div>
</div>
