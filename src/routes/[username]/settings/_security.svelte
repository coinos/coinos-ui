<script>
	import { tick } from 'svelte';
	import { t } from '$lib/translations';
	import { Icon, Qr } from '$comp';
	import { Pincode, PincodeInput } from 'svelte-pincode';
	import { user } from '$lib/store';
	import { put, success, failure } from '$lib/utils';

	let settingPin, setting2fa, disabling2fa;

	let code = [];
	let pin = '';
	let token = '';
	let tokenInput, pinInput;

	$: if (settingPin) pinInput && tick().then(pinInput.focusFirstInput);
	$: if (setting2fa) tokenInput && tick().then(tokenInput.focusFirstInput);

	let togglePin = () => (settingPin = !settingPin);
	let toggleEnabling = () => (setting2fa = !setting2fa);
	let toggleDisabling = () => (disabling2fa = !disabling2fa);

	$: enable2fa(token);
	let enable2fa = async (twoFa) => {
		try {
			if (setting2fa && token.length === 6) {
				await put('/enable2fa', { token });
				success('2fa enabled');
				$user.twofa = 1;
				toggleEnabling();
			}
		} catch (e) {
			failure('Failed to enable 2fa, try again');
		}
	};

	$: disable2fa(token);
	let disable2fa = async () => {
		try {
			if (disabling2fa && token.length === 6) {
				await put('/disable2fa', { token });
				success('2fa disabled');
				$user.twofa = 0;
				toggleDisabling();
			}
		} catch (e) {
			failure('Failed to disable 2fa, try again');
		}
	};
</script>

<div>
	<span class="font-bold mb-1">{$t('user.settings.securityPIN')}</span>
	<p class="text-secondary mb-1">
		{$t('user.settings.securityPINDescription')}
	</p>
	{#if settingPin}
		<div class="flex my-4">
			<div class="mx-auto">
				<Pincode bind:code bind:value={$user.pin} bind:this={pinInput}>
					<PincodeInput />
					<PincodeInput />
					<PincodeInput />
					<PincodeInput />
					<PincodeInput />
					<PincodeInput />
				</Pincode>
			</div>
		</div>
	{:else}
		<button type="button" class="primary" on:click={togglePin}
			><Icon icon="lock" style="mr-1" /> {$t('user.settings.setPIN')}</button
		>
	{/if}
</div>

<div>
	<label for="auto-lock" class="font-bold mb-1">{$t('user.settings.autoLock')}</label>
	<p class="text-secondary mb-1">
		{$t('user.settings.autoLockDescription')}
	</p>
	<select name="auto-lock" class="block py-3 w-full">
		<option value="5">5 min</option>
		<option value="10">10 min</option>
		<option value="30">30 min</option>
		<option value="60">1 h</option>
		<option value="480">8 h</option>
	</select>
</div>

<div>
	{#if setting2fa}
		<Qr text={$user.otpsecret} />

		<div class="text-center my-4">
			{$t('user.settings.accountId')}<br />
			<b>{$user.otpsecret}</b>
		</div>
		<div class="text-center my-4">
			{$t('user.settings.oneTimeCode')}<br />
			<Pincode bind:code bind:value={token} bind:this={tokenInput}>
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
			</Pincode>
		</div>
	{:else if disabling2fa}
		<div class="text-center my-4">
			{$t('user.settings.oneTimeCode')}<br />
			<Pincode bind:code bind:value={token} bind:this={tokenInput}>
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
			</Pincode>
		</div>
	{:else}
		<span class="font-bold mb-1">{$t('user.settings.twofa')}</span>
		<p class="text-secondary mb-1">
			{$t('user.settings.twofaDescription')}
		</p>
		{#if $user.twofa}
			<button type="button" class="primary" on:click={toggleDisabling}>
				<Icon icon="mobile" style="mr-1" />
				{$t('user.settings.twofaDisable')}
			</button>
		{:else}
			<button type="button" class="primary" on:click={toggleEnabling}>
				<Icon icon="mobile" style="mr-1" />
				{$t('user.settings.twofaSetup')}
			</button>
		{/if}
	{/if}
</div>
