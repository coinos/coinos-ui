<script>
	import { t } from '$lib/translations';
	import { Icon } from '$comp';
</script>

<div>
	<span class="font-bold mb-1">{$t('user.settings.securityPIN')}</span>
	<p class="text-secondary mb-1">
		{$t('user.settings.securityPINDescription')}
	</p>
	<button type="submit" class="p-3 border rounded-3xl font-bold flex justify-center items-center"
		><Icon icon="lock" style="mr-1" /> {$t('user.settings.setPIN')}</button
	>
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
	<span class="font-bold mb-1">{$t('user.settings.twofa')}</span>
	<p class="text-secondary mb-1">
		{$t('user.settings.twofaDescription')}
	</p>
	<button type="submit" class="p-3 border rounded-3xl font-bold flex justify-center items-center"
		><Icon icon="mobile" style="mr-1" /> {$t('user.settings.twofaSetup')}</button
	>
</div>
