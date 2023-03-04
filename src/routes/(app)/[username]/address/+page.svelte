<script>
	import { Icon, Qr } from '$comp';
	import { back, copy } from '$lib/utils';

	export let data;

	let { src, subject } = data;

	let qr;
	let text = subject.username + '@coinos.io';
</script>

<div class="space-y-8 container px-4 mx-auto my-20">
	<p class="text-secondary text-lg text-center">
		<a class="font-bold" href="https://lightningaddress.com/" target="_blank" rel="noreferrer">
			⚡️ lightning address
		</a>
		and
		<a
			class="font-bold"
			href="https://github.com/nostr-protocol/nips/blob/master/05.md"
			target="_blank"
			rel="noreferrer"
		>
			<Icon icon="nostr" style="w-6 inline" />
			nostr
      identifier
		</a>
	</p>
	<div class="relative flex">
		<div class="flex mx-auto w-[360px] h-[360px]">
      <img {src} class="w-[300px] h-[300px] mx-auto cursor-pointer z-10 mt-[20px]" bind:this={qr} alt={text} on:click={() => copy(text)} />
		</div>
		<div
			class="absolute m-auto left-0 right-0 w-[340px] h-[340px] rounded-full bg-gradient-to-r from-[#F2F6FC] to-[#E1E3FF] z-0"
		/>
	</div>

	<div class="w-full justify-center flex">
		<button
			class="text-left flex gap-2 rounded-full border py-3 px-5 hover:opacity-80 text-lg"
			on:click={() => copy(text)}
		>
			<div class="text-secondary break-all">{text}</div>
			<Icon icon="copy" style="mr-1 my-auto" />
		</button>
	</div>

	<div class="w-full justify-center flex">
		<button
			class="flex rounded-full border py-3 px-5 bg-black hover:opacity-80 font-semibold"
			on:click={back}
		>
			<div class="text-white">Back</div>
		</button>
	</div>
</div>
