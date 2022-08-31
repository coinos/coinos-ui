<script>
  import { tick } from "svelte";
	import { t } from '$lib/translations';
	import { Icon } from '$comp';
	import { Pincode, PincodeInput } from 'svelte-pincode';
	import { user } from '$lib/store';

	let settingPin, setting2fa;
	let togglePin = () => (settingPin = !settingPin);
	let toggle2fa = () => (setting2fa = !setting2fa);
	let code = [];
	let pin = '';
  let pinInput;

  $: if (settingPin) pinInput && tick().then(pinInput.focusFirstInput)
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

{#if setting2fa}
	QR
{:else}
	<div>
		<span class="font-bold mb-1">{$t('user.settings.twofa')}</span>
		<p class="text-secondary mb-1">
			{$t('user.settings.twofaDescription')}
		</p>
		<button type="button" class="primary">
			<Icon icon="mobile" style="mr-1" />
			{$t('user.settings.twofaSetup')}
		</button>
	</div>
{/if}
