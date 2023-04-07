<script>
	import { copy } from '$lib/utils';
	import { Code, Icon } from '$comp';
	import { PUBLIC_COINOS_URL } from '$env/static/public';
	export let data;
	let { user, token } = data;
	let api = 'https://hashme.io/api';

	let tokenSample = `export token="${token}"`;
</script>

<div class="space-y-8 lg:text-xl mt-20 pt-20 md:pt-0 w-full max-w-full">
	<h1 class="text-4xl">Documentation</h1>

	<p class="text-secondary">
		Hashme has a simple REST API that can be used to register accounts and make payments and
		queries.
	</p>

	<h2 class="text-2xl">Base URL</h2>
	<div class="bg-black text-white rounded-lg p-4 flex gap-4">
		<div>{api}</div>
		<button class="ml-auto my-auto invert opacity-90" on:click={() => copy(api)}
			><Icon icon="copy" style="w-10 max-w-none" /></button
		>
	</div>

	{#if token}
		<h2 class="text-2xl">Auth Token</h2>
		<p class="text-secondary">This token authorizes you to use the API as <b>{user.username}</b></p>
		<div class="bg-black text-white rounded-lg p-4 flex gap-4">
			<div class="w-full break-all">{tokenSample}</div>
			<button class="ml-auto my-auto invert opacity-90" on:click={() => copy(tokenSample)}
				><Icon icon="copy" style="w-10 max-w-none" /></button
			>
		</div>
	{/if}

	<h2 class="text-2xl">POST /register</h2>
	<p class="text-secondary">Register a new user account with a username and password</p>
	<Code sample="register" />

	<h2 class="text-2xl">POST /login</h2>
	<p class="text-secondary">Login to an account to get its auth token</p>
	<Code sample="login" />

	<h2 class="text-2xl">POST /invoice</h2>
	<p class="text-secondary">Create an invoice.</p>

	<div class="text-secondary">
		<div>Request params</div>
		<div class="grid grid-cols-3 ml-2">
			<div class="font-bold">type</div>
			<div class="col-span-2">bitcoin or lightning</div>
			<div class="font-bold">amount</div>
			<div class="col-span-2">amount in satoshis</div>
			<div class="font-bold">webhook</div>
			<div class="col-span-2">(optional) endpoint to hit when the invoice is paid</div>
			<div class="font-bold">secret</div>
			<div class="col-span-2">a secret for the webhook to check</div>
		</div>
	</div>

	<Code sample="invoice" />

	<p>Sample response</p>
	<Code sample="invoiceResponse" />
	<p>You can check the <b>received</b> field to see how many satoshis have been paid so far</p>

	<h2 class="text-2xl">GET /invoice/:hash</h2>
	<p class="text-secondary">
		Fetch an invoice by passing a bitcoin address or lightning payment hash
	</p>
	<Code sample="fetchInvoice" />

	<h2 class="text-2xl">GET /payments</h2>
	<p class="text-secondary">Get all payments sent or received by the current user</p>

	<div class="text-secondary">
		<div>Query params</div>
		<div class="grid grid-cols-3 ml-2">
			<div class="font-bold">start</div>
			<div class="col-span-2">only payments after this unix time</div>
			<div class="font-bold">end</div>
			<div class="col-span-2">only payments before this unix time</div>
			<div class="font-bold">limit</div>
			<div class="col-span-2">limit to this integer number of results</div>
			<div class="font-bold">offset</div>
			<div class="col-span-2">start limiting from this integer offset</div>
		</div>
	</div>
	<Code sample="payments" />

	<h2 class="text-2xl">Websocket API</h2>
	<p class="text-secondary">Subscribe to real time rates and payments</p>

	<div>Authenticate</div>
	<Code sample="socketAuth" />
</div>
