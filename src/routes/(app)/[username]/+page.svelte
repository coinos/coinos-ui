<script>
	import { Buffer } from 'buffer';
	import { entropyToMnemonic, mnemonicToSeedSync } from 'bip39';
	import { enhance } from '$app/forms';
	import { Feed, Icon, PageNotFound } from '$comp';
	import { t } from '$lib/translations';
	import { bech32m } from 'bech32';
	import { calculateId, signId } from 'nostr';
	import { bip32, stretch, post } from '$lib/utils';

	const { decode, fromWords } = bech32m;
	export let data;

	let message;

	let { events, user, subject, src, text } = data;
	let followed = false;

	let { username: n } = subject;

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
	};

	$: username = n.length > 60 ? n.substr(0, 6) : n;
</script>

<div class="container mx-auto w-full px-4 mb-4 flex flex-wrap md:flex-nowrap">
	<div class="hidden lg:block w-[240px] md:mr-10" />
	<div class="w-[240px] lg:absolute pt-20 space-y-5 left-20 mx-auto md:mr-10">
		<h1 class="text-3xl font-bold text-center mx-auto lg:text-left">{username}</h1>

		<div class="text-secondary mx-auto text-center lg:text-left lg:mx-0">
			{subject.address && subject.address !== 'null' ? subject.address : ''}
		</div>

		<div class="flex flex-wrap gap-2 w-full">
			{#if subject.username.length < 60}
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
			<div class="w-full flex">
				<a href={`/${subject.username}/message`} class="mx-auto">
					<button class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60">
						<div class="mx-auto flex">
							<Icon icon="support" style="mr-1" />
							<div>{$t('transactions.sendMessage')}</div>
						</div>
					</button>
				</a>
			</div>
		</div>
	</div>

	<div class="w-full md:pt-12 lg:pt-0">
		{#if user.username === n}
			<form on:submit|preventDefault={submit}>
				<input
					name="message"
					bind:value={message}
					placeholder="What's happening?"
					class="w-full my-5 max-w-lg mx-auto"
				/>
			</form>
		{/if}

		<div class="mx-auto space-y-5 mt-5 lg:max-w-lg xl:max-w-2xl">
			{#if events.length}
				<Feed {events} />
			{:else}
        <div class="text-center text-2xl mt-20">Nothing here yet. Post your first <a href="https://github.com/nostr-protocol/nostr#nostr---notes-and-other-stuff-transmitted-by-relays" class="underline">nostr</a> note!</div>
			{/if}
		</div>
	</div>
</div>
