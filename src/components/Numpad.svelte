<script>
	import { Left, Icon } from '$comp';
	import { selectedRate } from '$lib/store';
	import { f, s, post, warning, sat, sats } from '$lib/utils';
	import { t } from '$lib/translations';

	export let amount,
		currency,
		fiat = !amount,
		submit = undefined;

	let amountFiat = 0;
	let arrow = '<';

	$: update(amount, amountFiat);
	let update = (a, f) => {
		if (fiat) {
			amount = Math.round(f / ($selectedRate / sats));
		} else {
			amountFiat = ((a * $selectedRate) / sats).toFixed(2);
		}
	};

	let loading = false;

	let symbol =
		{
			USD: '$',
			CAD: '$',
			AUD: '$',
			NZD: '$',
			MXN: '$',
			BRL: '$',
			HKD: '$',
			TWD: '$',
			JPY: '¥',
			CNY: '¥',
			GBP: '£',
			EUR: '€',
			KRW: '₩'
		}[currency] || '';

	const numPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '<'];

	const handleInput = (value) => {
		if (fiat) {
			if (amountFiat === 0 && value !== '.' && value !== '<' && value !== '0') {
				amountFiat = value;
			} else if ((amountFiat === 0 || amountFiat === '0') && value === '0') {
				return;
			} else if (amountFiat === 0 && value === '.') {
				amountFiat = '0.';
			} else if (amountFiat !== 0 && amountFiat.includes('.') && value === '.') {
				return;
			} else if (value === '<') {
				if (amountFiat !== 0) {
					amountFiat = amountFiat.slice(0, amountFiat.length - 1);
					if (amountFiat.length === 0) {
						amountFiat = 0;
						amountSats = 0;
					}
				}
			} else if (value !== '.' && value !== '<' && parseInt(amountFiat + value) > $selectedRate) {
				warning($t('user.receive.lessThan1BTCWarning'));
			} else if (amountFiat !== 0 && amountFiat.match(/\.../)) {
				return;
			} else {
				amountFiat = amountFiat + value;
			}
		} else {
			if (value === '.') {
				return;
			} else if (!amountSats && value !== '<' && value !== '0') {
				amountSats = parseInt(value);
			} else if (value === '<') {
				if (amountSats !== 0) {
					amountSats = Math.floor(amountSats / 10);
					if (amountSats.length === 0) {
						amountSats = 0;
						amountFiat = 0;
					}
				}
			} else if (value !== '<' && parseInt(amountSats + value) > sats) {
				warning($t('user.receive.lessThan1BTCWarning'));
			} else {
				amount = parseInt(amount.toString() + value);
			}
		}
	};

	$: html = fiat ? amountFiat : s(amountSats);

	let prev = '';

	let input = (e) => {
		if (prev === '0' && html !== '0.') {
			prev = '';
			html = html.replace('0', '');
		}

		let sel = getSelection();
		let i = sel.focusOffset;

		let clean = html
			.substr(0, 15)
			.replace(/[^0-9.,]+/g, '')
			.replace('.', 'F')
			.replace(/\./g, '')
			.replace('F', '.');

		if (fiat) clean = clean.replace(',', '');
		if (clean !== html) {
			html = clean;
			i = html.length;
		}

		if (amount > sats && html.length > prev.length) {
			html = prev;
			warning($t('user.receive.lessThan1BTCWarning'));
			i--;
		}

		if (fiat) {
			amountFiat = html;
		} else {
			amountSats = parseInt(html.replace(/,/g, ''));
		}

		if (!amountSats) amountSats = null;

		setTimeout(() => {
			if (!fiat) {
				let p = prev.split(',')[0].length;
				if (html.length > prev.length && p === 3) i++;
				if (html.length < prev.length && p === 1 && i > 1) i--;
			}

			let node = e.target.childNodes[0];
			let range = document.createRange();

			if (node) {
				range.setStart(node, i);
				range.setEnd(node, i);

				let sel = getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			}

			prev = html.toString();
		}, 0);
	};

	let focus = (e) => {
		let range = document.createRange();
		range.selectNodeContents(e.target);
		let sel = getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	};

	let keydown = (e) => e.key === 'Enter' && (e.preventDefault() || submit.click());
</script>

<div class="flex justify-center items-center mb-3 px-3">
	<div class="space-y-5">
		<div class="text-center">
			<div class="text-5xl md:text-6xl font-semibold tracking-widest flex justify-center">
				<div class="my-auto" class:text-5xl={!fiat}>{fiat ? symbol : '⚡️'}</div>
				<div
					contenteditable
					bind:innerHTML={html}
					on:focus={focus}
					on:input={input}
					on:keydown={keydown}
					class="outline-none my-auto"
				/>
			</div>
			<div class="mt-2">
				<span class="text-secondary mr-1">{fiat ? sat(amount) : f(amountFiat, currency)}</span>
				<button
					type="button"
					on:click={() => {
						if (fiat) {
							amountSats = parseInt((amountFiat / ($selectedRate / sats)).toFixed(0));
						} else {
							amountFiat =
								(amountSats * ($selectedRate / sats)).toFixed(2) > 0.0
									? (amountSats * ($selectedRate / sats)).toFixed(2)
									: 0;
						}
						fiat = !fiat;
					}}><Icon icon="swap" style="inline hover:opacity-80" /></button
				>
			</div>
		</div>

		<div class="grid grid-cols-3 gap-2 w-[300px] mx-auto">
			{#each numPad as value}
				{#if value === arrow}
					<button
						type="button"
						class="bg-primary rounded-xl py-4 px-8 font-semibold active:bg-black active:text-white flex justify-center items-center hover:opacity-80"
						on:click={() => handleInput(value)}
					>
						<Left />
					</button>
				{:else}
					<button
						type="button"
						class="bg-primary rounded-xl py-4 px-8 font-semibold active:bg-black active:text-white hover:opacity-80"
						on:click={() => handleInput(value)}>{value}</button
					>
				{/if}
			{/each}
		</div>
	</div>
</div>
