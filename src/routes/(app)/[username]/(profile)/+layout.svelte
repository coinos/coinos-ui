<script>
	import { Icon } from '$comp';
	import { t } from '$lib/translations';
	import { sign, send } from '$lib/nostr';

	export let data;
	let events, user, subject, src, text;
	$: ({ events, user, subject, src, text } = data);
	$: ({ username: n } = subject);

	$: username = n.length > 60 ? n.substr(0, 6) : n;

	let follow = async () => {
		user.follows.push(['p', subject.pubkey, 'wss://nostr.coinos.io', subject.username]);
		update();
	};

	let unfollow = async () => {
		user.follows.splice(
			user.follows.findIndex((t) => t[1] === subject.pubkey),
			1
		);
		update();
	};

	let update = async () => {
		let event = {
			pubkey: user.pubkey,
			created_at: Math.floor(Date.now() / 1000),
			kind: 3,
			content: '',
			tags: user.follows
		};

		user.follows = user.follows;

		await sign({ event, user });
		await send(event);
	};

	$: following = user?.follows.find((t) => t.includes(subject.pubkey));
</script>

<div class="container mx-auto w-full px-4 mb-4 flex flex-wrap md:flex-nowrap">
	<div class="hidden lg:block w-[240px] md:mr-10" />
	<div class="w-[240px] lg:absolute pt-20 space-y-5 left-20 mx-auto md:mr-10">
		<h1 class="text-3xl font-bold text-center mx-auto lg:text-left">{username}</h1>

		<div class="text-secondary mx-auto text-center lg:text-left lg:mx-0">
			{subject.address && subject.address !== 'null' ? subject.address : ''}
		</div>

		<div class="flex justify-around">
			<a href={`/${subject.username}/follows`}><b>{subject.follows.length}</b> Following</a>
			<a href={`/${subject.username}/followers`}><b>{subject.followers.length}</b> Followers</a>
		</div>

		<div class="flex flex-wrap gap-2 w-full">
			{#if user && user.username !== subject.username}
				{#if following}
					<div class="w-full flex">
						<button
							class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60"
							on:click={unfollow}
						>
							<div class="mx-auto flex">
								<Icon icon={'profile'} style="my-auto" />
								<div>{$t('user.unfollow')}</div>
							</div>
						</button>
					</div>
				{:else}
					<div class="w-full flex">
						<button
							class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60"
							on:click={follow}
						>
							<div class="mx-auto flex">
								<Icon icon={'profile'} style="my-auto" />
								<div>{$t('user.follow')}</div>
							</div>
						</button>
					</div>
				{/if}
			{/if}
			{#if !subject.anon}
				<div class="w-full flex">
					<a href={`/${subject.username}/receive`} class="mx-auto">
						<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60">
							<div class="mx-auto flex">
								<div style="mr-1">⚡️</div>
								<div>{$t('user.lightning')} {$t('user.invoice')}</div>
							</div>
						</button>
					</a>
				</div>

				<div class="w-full flex">
					<a href={`/${subject.username}/receive/bitcoin`} class="mx-auto">
						<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60">
							<div class="mx-auto flex">
								<img src="/images/bitcoin.svg" class="w-5 my-auto mr-1" />
								<div>{$t('user.bitcoin')} {$t('user.invoice')}</div>
							</div>
						</button>
					</a>
				</div>

				{#if user?.username !== subject.username}
					<div class="w-full flex">
						<a href={`/${subject.username}/request`} class="mx-auto">
							<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60">
								<div class="mx-auto flex">
									<Icon icon="support" style="mr-1" />
									<div>{$t('transactions.requestAnInvoice')}</div>
								</div>
							</button>
						</a>
					</div>
				{/if}
			{/if}
		</div>
	</div>

	<div class="w-full md:pt-12 lg:pt-0">
		<div class="mx-auto space-y-5 mt-5 lg:max-w-lg xl:max-w-2xl">
			<slot />
		</div>
	</div>
</div>
