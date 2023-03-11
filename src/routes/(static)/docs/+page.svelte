<script>
	import { copy } from '$lib/utils';
	import { Code, Icon } from '$comp';
	import { PUBLIC_COINOS_URL } from '$env/static/public';
	export let data;
	let { token } = data;
	let api = PUBLIC_COINOS_URL + '/api';

	if (!token) token = '<login to see your token here>';
	let tokenSample = `export token="${token}"`;
</script>

<div class="space-y-8 lg:text-xl mt-20 w-full max-w-full">
	<h1 class="text-4xl">API Documentation</h1>

	<p class="text-secondary">
		Coinos has a simple REST API that can be used to register accounts, fetch data, and make
		payments
	</p>

	<p class="text-secondary">* = required parameter</p>

	<h2 class="text-2xl">Base URL</h2>
	<div class="bg-black text-white rounded-lg p-4 flex gap-4">
		<div>{api}</div>
		<button class="ml-auto my-auto invert opacity-90" on:click={() => copy(api)}
			><Icon icon="copy" style="w-10 max-w-none" /></button
		>
	</div>

	<h2 class="text-2xl">Auth Token</h2>
	<p class="text-secondary">This JWT authorizes you to use the API</p>
	<div class="bg-black text-white rounded-lg p-4 flex gap-4">
		<div class="w-full break-all">{tokenSample}</div>
		<button class="ml-auto my-auto invert opacity-90" on:click={() => copy(tokenSample)}
			><Icon icon="copy" style="w-10 max-w-none" /></button
		>
	</div>

	<h2 class="text-2xl">POST /register</h2>
	<p class="text-secondary">Register a new user account with a username and password</p>
	<Code sample="register" />

	<h2 class="text-2xl">POST /login</h2>
	<p class="text-secondary">Login to an account to get its auth token</p>
	<Code sample="login" />

	<h2 class="text-2xl">POST /invoice</h2>
	<p class="text-secondary">Create an invoice.</p>
	<div>
		<div class="text-secondary">
			<span class="font-mono font-bold">type</span>: bitcoin or lightning
		</div>
		<div class="text-secondary">
			<span class="font-mono font-bold">amount</span>: amount in satoshis
		</div>
		<div class="text-secondary">
			<span class="font-mono font-bold">webhook</span>: an endpoint to hit when the invoice is paid
		</div>
		<div class="text-secondary">
			<span class="font-mono font-bold">secret</span>: a secret string for the webhook to check
		</div>
	</div>

	hey
	<Code sample="invoice" />

	<h2 class="text-2xl">GET /invoice/:hash</h2>
	<p class="text-secondary">
		Fetch an invoice by passing a bitcoin address or lightning payment hash
	</p>
	<Code sample="fetchInvoice" />
</div>

<!-- echo Login and get an API token -->
<!-- token=$(curl -s "$api/taboggan" -H "$json" -d '{"username": "'$username'", "password": "'$password'"}' | jq -r .token) -->
<!-- echo $token -->
<!-- echo "" -->
<!--  -->
<!-- username="apidemo" -->
<!-- token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFwaWRlbW8iLCJpYXQiOjE2NDAxMzIwNjd9.aBtcrnLjDS_Zixn5_X_N8sqX0KxTDrVySSqh1fa96rk" -->
<!-- auth="Authorization: Bearer $token" -->
<!--  -->
<!-- echo Get account balance in satoshis -->
<!-- curl -s "$api/me" -H "$json" -H "$auth" | jq '.account.balance' -->
<!-- echo "" -->
<!--  -->
<!-- echo Get the current price of bitcoin in USD -->
<!-- curl -s "$api/rates" -H "$json" | jq '.USD' -->
<!-- echo "" -->
<!--  -->
<!-- echo Create a legacy Bitcoin address  -->
<!-- address=$(curl -s "$api/address?network=bitcoin&#38;type=legacy" -H "$auth" -H "$json" | jq -r .address) -->
<!-- echo $address -->
<!-- echo "" -->
<!--  -->
<!-- echo Create an invoice to associate the address with the user -->
<!-- curl -s "$api/invoice" -H "$json" -d '{"invoice": {"address": "'$address'", "network": "bitcoin"}, "user": {"username": "'$username'"}}' > /dev/null -->
<!-- echo "" -->
<!--  -->
<!-- msg="testingtesting123" -->
<!-- echo Sign a message with the address: $msg $address -->
<!-- curl -s "$api/signMessage" -H "$json" -H "$auth" -d '{"address": "'$address'", "message": "'$msg'"}' -->
<!-- echo "" -->
<!--  -->
<!-- echo Create a bech32 Bitcoin address  -->
<!-- address=$(curl -s "$api/address?network=bitcoin&#38;type=bech32" -H "$auth" -H "$json" | jq -r .address) -->
<!-- echo $address -->
<!-- echo "" -->
<!--  -->
<!-- echo Create a lightning invoice -->
<!-- text=$(curl -s "$api/lightning/invoice" -H "$auth" -H "$json" -d '{"amount": 100}') -->
<!-- echo $text -->
<!-- echo "" -->
<!--  -->
<!-- echo Associate the lightning invoice with the user -->
<!-- curl -s "$api/invoice" -H "$json" -d '{"invoice": {"text": "'$text'", "network": "bitcoin"}, "user": {"username": "'$username'"}}' > /dev/null -->
<!-- echo "" -->
<!--  -->
<!-- echo Get an external invoice -->
<!-- payreq=$(curl -s https://legend.lnbits.com/api/v1/payments -H "$json" -H "x-api-key: 698e5b6744f8442880ba3ad630756c02" -d '{ "out": false, "amount": 50, "memo": "test", "unit": "sat", "lnurl_callback": null }' | jq -r .payment_request) -->
<!-- echo $payreq -->
<!-- echo "" -->
<!--  -->
<!-- echo Send a lightning payment -->
<!-- curl -s "$api/lightning/send" -H "$json" -H "$auth" -d '{"payreq": "'$payreq'"}' | jq -r '{ amount, fee, balance: (.account.balance)}' -->
<!-- echo "" -->
<!--  -->
<!-- echo Send a bitcoin payment -->
<!-- tx=$(curl -s "$api/bitcoin/fee" -H "$json" -H "$auth" -d '{"address": "bc1qqc9azhdjjpdxenrndt8cw4tw9del5pyrjn0wln", "amount": 1200, "feeRate": 1000 }') -->
<!-- hex=$(echo $tx | jq -r .tx.hex) -->
<!-- fee=$(echo $tx | jq -r .tx.fee) -->
<!--  -->
<!-- curl -s "$api/bitcoin/send" -H "$json" -H "$auth" -d '{"address": "bc1qqc9azhdjjpdxenrndt8cw4tw9del5pyrjn0wln", "tx": { "hex": "'$hex'", "fee": "'$fee'" }}' | jq -r '{ amount, fee, balance: (.account.balance)}' -->
<!-- echo "" -->

<!-- `} -->
