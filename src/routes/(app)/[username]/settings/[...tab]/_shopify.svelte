<script>
	import { t } from '$lib/translations';
	import { Icon } from '$comp';
	import { page } from '$app/stores';

	export let user;
  $: paymentsUrl = user.shopifyStore && "https://admin.shopify.com/store/" + user.shopifyStore + "/settings/payments";
  $: checkoutUrl = user.shopifyStore && "https://admin.shopify.com/store/" + user.shopifyStore + "/settings/checkout#:r86:Labelt";
</script>

<div>
	<label for="username" class="font-bold mb-1 block">Store ID</label>
	<div class="flex mb-2">
		<div class="text-gray-600 p-4 my-auto bg-gray-100 border rounded-l-2xl border-r-0 pr-1">admin.shopify.com/store/</div>
		<input
			type="text"
			name="username"
			bind:value={user.shopifyStore}
			class="border-l-0 rounded-l-none w-auto min-w-0 pr-1 grow"
		/>
	</div>
	<p class="text-secondary my-2">
  Visit your store <a class:active={!!paymentsUrl} href={paymentsUrl || undefined}>Settings</a> and add <code class="text-black">Bitcoin</code> under <code class="text-black">Payments -> Manual payment methods</code>
	</p>
</div>

<div>
	<label for="display" class="font-bold mb-1 block">API Public Key</label>
	<input type="text" name="display" bind:value={user.shopifyPubkey} />
</div>

<div>
	<label for="display" class="font-bold mb-1 block">API Secret Key</label>
	<input type="text" name="display" bind:value={user.shopifySecret} />
</div>

<div>
	<label for="display" class="font-bold mb-1 block">Additional Scripts</label>
  <textarea rows={5} type="text" name="display" readonly><script src="{`${$page.url.protocol}//${$page.url.host}/${user.username}/shopify.js`}"> </script></textarea>

	<p class="text-secondary my-2">
  Copy this into your Shopify store <a class:active={!!paymentsUrl}  href={checkoutUrl}>Settings</a> under <code class="text-black">Checkout -> Additional scripts</code>
	</p>
</div>

<style>
  .active {
    @apply text-blue-500;
  } 
</style>
