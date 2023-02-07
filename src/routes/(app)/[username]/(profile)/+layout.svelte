<script>
	import { f, s, sats } from '$lib/utils';
	import { animatedRate, selectedRate } from '$lib/store';
	import { Icon } from '$comp';
	import { t } from '$lib/translations';
	import { sign, send } from '$lib/nostr';
	import { v4 } from 'uuid';

	export let data;
	let events, user, subject, src, text;
	$: ({ events, user, subject, src, text } = data);
	$: ({ currency, username: n, display } = subject);

	$: username = n.length > 60 ? n.substr(0, 6) : display || n;

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

		await sign({ event, user });
		await send(event);

		user.follows = user.follows;
	};

	$: following = !!user?.follows.find((t) => t.includes(subject.pubkey));

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
</script>

<div class="container mx-auto w-full px-4 mb-4 flex flex-wrap lg:flex-nowrap">
	<div class="hidden lg:block w-[240px] lg:mr-10" />
	<div class="w-[240px] lg:absolute space-y-5 left-20 mx-auto lg:mr-10 mb-10">
		<h1 class="text-3xl font-bold text-center mx-auto">{display || username}</h1>

		<div class="text-secondary mx-auto text-center lg:text-left lg:mx-0">
			{subject.address && subject.address !== 'null' ? subject.address : ''}
		</div>

		<div class="flex justify-around">
			<a href={`/${subject.pubkey}/follows`}
				><b>{subject.follows.length}</b>
				<span class="text-secondary">{$t('user.following')}</span></a
			>
			<a href={`/${subject.pubkey}/followers`}
				><b>{subject.followers.length}</b>
				<span class="text-secondary">{$t('user.followers')}</span></a
			>
		</div>

		<div class="flex flex-wrap gap-2 w-full">
			{#if user && user.username !== subject.username && subject.pubkey}
				{#if following}
					<div class="w-full flex">
						<button
							class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60 bg-black text-white"
							on:click={unfollow}
						>
							<div class="mx-auto flex">
								<Icon icon={'profile'} style="my-auto h-6 mr-2 invert" />
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
								<Icon icon={'profile'} style="my-auto h-6 mr-2" />
								<div class="my-auto mt-1">{$t('user.follow')}</div>
							</div>
						</button>
					</div>
				{/if}

				<div class="w-full flex">
					<a href={`/${subject.pubkey}/messages`} class="mx-auto">
						<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60">
							<div class="mx-auto flex">
								<Icon icon="support" style="mr-2 my-auto" />
								<div class="mt-1 my-auto">{$t('user.message')}</div>
							</div>
						</button>
					</a>
				</div>
			{/if}
			{#if !subject.anon && subject.username !== user?.username}
				<div class="w-full flex">
					<a href={user ? `/send/${subject.username}` : `/${subject.username}/receive`} class="mx-auto">
						<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60">
							<div class="mx-auto flex">
								<Icon icon="send" style="mr-2" />
								<div class="mt-1">{$t('user.pay')}</div>
							</div>
						</button>
					</a>
				</div>
			{/if}

			{#if user?.id === subject.id}
				<div class="w-full flex">
					<a href={`/send`} class="mx-auto">
						<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60">
							<div class="mx-auto flex">
								<Icon icon="send" style="mr-2" />
								<div class="mt-1">{$t('user.dashboard.send')}</div>
							</div>
						</button>
					</a>
				</div>
				<div class="w-full flex">
					<a href={`/${subject.username}/receive`} class="mx-auto">
						<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60">
							<div class="mx-auto flex">
								<Icon icon="numpad" style="mr-2" />
								<div class="mt-1">{$t('user.dashboard.receive')}</div>
							</div>
						</button>
					</a>
				</div>
				<!-- <div class="w-full flex"> -->
				<!-- 	<a href={`/${subject.username}/receive`} class="mx-auto"> -->
				<!-- 		<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60"> -->
				<!-- 			<div class="mx-auto flex"> -->
				<!-- 				<Icon icon="support" style="mr-2" /> -->
				<!-- 				<div class="mt-1">{$t('user.messages')}</div> -->
				<!-- 			</div> -->
				<!-- 		</button> -->
				<!-- 	</a> -->
				<!-- </div> -->
			{/if}
		</div>
	</div>

	<div class="w-full">
		<div class="mx-auto space-y-5 lg:max-w-lg xl:max-w-2xl">
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
