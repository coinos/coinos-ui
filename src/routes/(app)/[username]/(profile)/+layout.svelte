<script>
	import { f, s, copy, sats } from '$lib/utils';
	import { animatedRate, selectedRate } from '$lib/store';
	import { Icon } from '$comp';
	import { t } from '$lib/translations';
	import { sign, send } from '$lib/nostr';
	import { page } from '$app/stores';

	export let data;
	let events, user, subject, src, text;
	$: ({ events, user, subject, src, text } = data);
	$: ({ currency, username: n, display, pubkey, npub } = subject);

	$: username = n.length > 60 ? n.substr(0, 6) : display || n;

	let follow = async () => {
		user.follows.push(['p', pubkey, 'wss://nostr.coinos.io', subject.username]);
		update();
	};

	let unfollow = async () => {
		user.follows.splice(
			user.follows.findIndex((t) => t[1] === pubkey),
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

		await sign({ event, user });
		await send(event);

		user.follows = user.follows;
	};

	$: following = !!user?.follows.find((t) => t.includes(pubkey));

	let ease = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t);
	let i;

	let o = $selectedRate;
	$: animate($selectedRate);
	let animate = (n) => {
		clearInterval(i);

		let t = 0;
		let d = o - n;

		i = setInterval(() => {
			$animatedRate = (o - d * ease(t / 100)).toFixed(2);
			if (t > 80) (o = n) && clearInterval(i);
			t++;
		}, 10);
	};

	$: paymentsTab = $page.url.pathname.includes('payments');
	$: messagesTab = $page.url.pathname.includes('messages');
</script>

<div class="container mx-auto w-full px-4 flex flex-wrap lg:flex-nowrap">
	<div class="hidden lg:block w-[240px] lg:mr-10" />
	<div class="w-[240px] lg:absolute space-y-3 left-20 mx-auto lg:mr-10 mb-10">
		<a href={`/${subject.username}/address`}>
			<div>
				<h1 class="text-3xl font-bold text-center mx-auto">{display || username}</h1>
				<div class="text-center">
					<div class="my-auto ml-1">{username}@coinos.io</div>
				</div>
			</div>
		</a>

		<div class="text-secondary mx-auto text-center lg:text-left lg:mx-0">
			{subject.address && subject.address !== 'null' ? subject.address : ''}
		</div>

		<div class="flex justify-around">
			<a href={`/${pubkey}/follows`}
				><b>{subject.follows.length}</b>
				<span class="text-secondary">{$t('user.following')}</span></a
			>
			<a href={`/${pubkey}/followers`}
				><b>{subject.followers.length}</b>
				<span class="text-secondary">{$t('user.followers')}</span></a
			>
		</div>

		<div class="flex flex-wrap gap-2 w-full">
			{#if user && user.username !== subject.username && pubkey}
				{#if following}
					<div class="w-full flex">
						<button
							class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60 bg-black text-white"
							on:click={unfollow}
						>
							<div class="mx-auto flex">
								<div class="my-auto mt-1">{$t('user.following')}</div>
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
								<div class="my-auto mt-1">{$t('user.follow')}</div>
							</div>
						</button>
					</div>
				{/if}
			{/if}
		</div>
	</div>

	<div class="w-full">
		<div class="mx-auto space-y-5 lg:max-w-lg xl:max-w-2xl">
			<div class="font-bold flex justify-center items-center border-b pb-3 text-secondary">
				<a href={`/${username}/payments`} class="w-full">
					<div class="relative">
						<button class="mx-auto flex hover:opacity-80" class:text-black={paymentsTab}>
							Feed
						</button>
						<div
							class="absolute w-full border-b-4 border-black -bottom-3"
							class:hidden={!paymentsTab}
						/>
					</div>
				</a>
				<a href={`/${username}/payments`} class="w-full">
					<div class="relative">
						<button class="mx-auto flex hover:opacity-80" class:text-black={paymentsTab}>
							Payments
						</button>
						<div
							class="absolute w-full border-b-4 border-black -bottom-3"
							class:hidden={!paymentsTab}
						/>
					</div>
				</a>
				<a href={`/${username}/messages`} class="w-full">
					<div class="relative">
						<button class="mx-auto flex hover:opacity-80 relative" class:text-black={messagesTab}>
							Messages
						</button>
						<div
							class="absolute w-full border-b-4 border-black -bottom-3"
							class:hidden={!messagesTab}
						/>
					</div>
				</a>
			</div>
			<slot />
		</div>
	</div>
</div>

{#if currency && $animatedRate}
	<div class="flex fixed w-full px-4 bg-white py-2 bottom-0 bg-opacity-90 tabular-nums">
		<div class="text-secondary flex mr-auto">
			<div class="flex mr-1">
				<div class="my-auto mr-1">1</div>
				<img src="/images/bitcoin.svg" class="w-5 my-auto" alt="Bitcoin" />
			</div>
			<div>= {f($animatedRate, currency)}</div>
		</div>
		<div class="text-secondary flex ml-auto">
			<div class="flex">
				<div class="mr-1">⚡️{s((1 * sats) / $animatedRate)} =</div>
				<div>{f(1, currency)}</div>
			</div>
		</div>
	</div>
{/if}
