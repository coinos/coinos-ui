<script>
	import { Avatar } from '$comp';
	import { browser } from '$app/environment';
	import VirtualScroll from 'svelte-virtual-scroll-list';
	import { punk } from '$lib/utils';
	import { Buffer } from 'buffer';
	import { entropyToMnemonic, mnemonicToSeedSync } from 'bip39';
	import { enhance } from '$app/forms';
	import { bech32m } from 'bech32';
	import { calculateId, signId } from 'nostr';
	import { bip32, stretch, post } from '$lib/utils';

	export let events;
	export let user;

	const { decode, fromWords } = bech32m;

	let message;

	let submit = async () => {
		let mnemonic, key, password, seed, entropy, child, privkey;
		entropy = Buffer.from(
			await crypto.subtle.decrypt(
				{ name: 'AES-GCM', iv: new Uint8Array(16) },
				await stretch(password, Buffer.from(user.salt, 'hex')),
				Uint8Array.from(fromWords(decode(user.cipher, 180).words))
			),
			'hex'
		).toString('hex');

		mnemonic = entropyToMnemonic(entropy);
		seed = mnemonicToSeedSync(mnemonic);
		key = bip32.fromSeed(seed);
		child = key.derivePath("m/44'/1237'/0'/0/0");
		privkey = child.privateKey;

		let event = {
			pubkey: user.pubkey,
			created_at: Math.floor(Date.now() / 1000),
			kind: 1,
			content: message,
			tags: []
		};

		event.id = await calculateId(event);
		event.sig = await signId(privkey, event.id);
		await post(`/${user.username}`, { event });

		event.user = user;
		event.seen = event.created_at;
		events[event.id] = event;
		events = events;
	};

	let distance = (date) => {
		let m = 60;
		let h = 60 * m;
		let d = 24 * h;

		let diff = Math.round(Date.now() / 1000) - date;
		return diff > d
			? Math.round(diff / d) + 'd'
			: diff > h
			? Math.round(diff / h) + 'h'
			: diff > m
			? Math.round(diff / m) + 'm'
			: diff > 2
			? diff + 's'
			: 'now';
	};

	let w;

	$: sorted = Object.values(events)
		.filter((ev) => ev?.pubkey)
		.sort((a, b) => b.seen - a.seen);
</script>

<svelte:window bind:innerWidth={w} />

<form on:submit|preventDefault={submit} class="flex justify-center gap-4 max-w-2xl mx-auto">
	<div class="grow">
		<input
			name="message"
			bind:value={message}
			placeholder="What's happening?"
			class="my-5 mx-auto"
		/>
	</div>
	<button class="rounded-full border py-4 px-5 font-bold hover:opacity-80 w-40 my-5">Post</button>
</form>

{#if browser}
	<VirtualScroll data={sorted} key="id" let:data pageMode={true} estimateSize={200}>
		<div class="flex border-b py-4 text-sm lg:text-lg text-secondary" :key={data.id}>
			<a href={`/${data.user.anon ? data.user.pubkey : data.user.username}`}>
				<div class="mb-auto mr-2">
					<div class="md:hidden">
						<Avatar size={12} user={data.user} disabled={true} />
					</div>
					<div class="hidden md:block">
						<Avatar size={20} user={data.user} disabled={true} />
					</div>
				</div>
			</a>

			<div class="grow" style={`max-width: ${w - 100}px`}>
				<div class="w-full flex pb-1 text-black">
					<div>
						{data.user.display_name || ''} <span class="text-secondary">@{data.user.username}</span>
					</div>
					<div class="text-secondary">&nbsp;{distance(data.seen)}</div>
				</div>
				<div class="break-words">
					{data.content}
				</div>
			</div>
		</div>
	</VirtualScroll>
{/if}
