<script>
	import { tick } from 'svelte';
	import { t } from '$lib/translations';
	import { Icon, Qr } from '$comp';
	import { Pincode, PincodeInput } from 'svelte-pincode';
	import { post, success, failure } from '$lib/utils';
	import { pin as current } from '$lib/store';

	export let user, submit;

	let settingPin, setting2fa, disabling2fa;

	let token = '';
	let pinCode = [];
	let verifyCode = [];
	let tokenInput, pinInput, verifyInput;
	let verifying = false;
	let old;

	let startVerifying = () => {
		verifying = true;
	};

	$: pin = pinCode.join('');

	let locked;
	$: verifyCode.join('').length > 5 && checkPin();
	let checkPin = async () => {
		old = $current;
		if (locked) return;
		locked = true;

		let verify = verifyCode.join('');

		pinCode = ['', '', '', '', '', ''];
		verifyCode = ['', '', '', '', '', ''];
		settingPin = false;

		try {
			if (pin.length > 5 && pin === verify) {
				user.haspin = true;
				$current = pin;
				submit.click();
			} else {
				failure('Pin mismatch, try again');
				settingPin = true;
				pinInput.focusFirstInput();
			}
		} catch (e) {
			failure('Problem setting PIN');
		}

		verifying = false;

		await new Promise((r) => setTimeout(r, 500));
		locked = false;
	};

	$: if (verifying) verifyInput && tick().then(verifyInput.focusFirstInput);
	$: if (settingPin) pinInput && tick().then(pinInput.focusFirstInput);
	$: if (setting2fa || disabling2fa) tokenInput && tick().then(tokenInput?.focusFirstInput);

	let reset = () => {
		token = '';
		return true;
	};

	let togglePin = async () => {
		if (user.haspin) {
			try {
				pin = null;
				submit.click();
			} catch (e) {
				failure('Failed to disable pin');
			}
		} else {
			settingPin = true;
		}
	};

	let toggleEnabling = () => reset() && (setting2fa = !setting2fa);
	let toggleDisabling = () => reset() && (disabling2fa = !disabling2fa);

	$: enable2fa(token);
	let enable2fa = async (twoFa) => {
		try {
			if (setting2fa && token.length === 6) {
				await post('/enable2fa', { token });
				success('2FA enabled');
				user.twofa = 1;
				toggleEnabling();
			}
		} catch (e) {
			failure('Failed to enable 2FA, try again');
		}
	};

	$: disable2fa(token);
	let disable2fa = async () => {
		try {
			if (disabling2fa && token.length === 6) {
				await post('/disable2fa', { token });
				success('2FA disabled');
				user.twofa = 0;
				toggleDisabling();
			}
		} catch (e) {
			failure('Failed to disable 2FA, try again');
		}
	};

	$: otpUri = `otpauth://totp/coinos:${user.username}?secret=${user.otpsecret}&period=30&digits=6&algorithm=SHA1&issuer=coinos`;
</script>

<div>
	<input type="hidden" name="newpin" value={pin} />

	<span class="font-bold mb-1">{verifying ? 'Verify' : 'Security'} PIN</span>
	<p class="text-secondary mb-1">
		{$t('user.settings.securityPINDescription')}
	</p>
	{#if settingPin}
		<div class="flex my-4">
			<div class="mx-auto">
				<div class:hidden={verifying}>
					<Pincode on:complete={startVerifying} bind:code={pinCode} bind:this={pinInput}>
						<PincodeInput />
						<PincodeInput />
						<PincodeInput />
						<PincodeInput />
						<PincodeInput />
						<PincodeInput />
					</Pincode>
				</div>
				<div class:hidden={!verifying}>
					<Pincode bind:code={verifyCode} bind:this={verifyInput}>
						<PincodeInput />
						<PincodeInput />
						<PincodeInput />
						<PincodeInput />
						<PincodeInput />
						<PincodeInput />
					</Pincode>
				</div>
			</div>
		</div>
	{:else}
		<button type="button" class="primary" on:click={togglePin}
			><Icon icon="lock" style="mr-1" /> {user.haspin ? 'Disable Pin' : 'Enable Pin'}</button
		>
	{/if}
</div>

<!-- TODO
<div>
	<label for="auto-lock" class="font-bold mb-1">{$t('user.settings.autoLock')}</label>
	<p class="text-secondary mb-1">
		{$t('user.settings.autoLockDescription')}
	</p>
	<select name="auto-lock" class="select-styles block py-3 w-full">
		<option value="5">5 min</option>
		<option value="10">10 min</option>
		<option value="30">30 min</option>
		<option value="60">1 h</option>
		<option value="480">8 h</option>
	</select>
</div> -->

<div>
	<span class="font-bold mb-1">{$t('user.settings.twofa')}</span>
	<p class="text-secondary mb-4">
		{$t('user.settings.twofaDescription')}
	</p>
	{#if setting2fa}
		<a href={otpUri}>
			<Qr text={otpUri} />
		</a>

		<div class="text-center my-4">
			{$t('user.settings.accountId')}<br />
			<b>{user.otpsecret}</b>
		</div>

		<div class="text-center my-4">
			{$t('user.settings.oneTimeCode')}<br />
			<Pincode bind:value={token} bind:this={tokenInput}>
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
			<Pincode bind:value={token} bind:this={tokenInput}>
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
				<PincodeInput />
			</Pincode>
		</div>
	{:else if user.twofa}
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
</div>
