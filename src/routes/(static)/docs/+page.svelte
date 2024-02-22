<script>
	import { copyNoNewlines as copy } from '$lib/utils';
	import { PUBLIC_COINOS_URL } from '$env/static/public';
	export let data;
	let { user, token } = data;
	let api = 'https://swapee.me/api';

  import Code from "$comp/Code.svelte";
  import Icon from "$comp/Icon.svelte";


  let tokenSample = token
    ? `export token="${token}"`
    : `export token=<your auth token>`;
</script>

<div class="space-y-8 lg:text-xl mt-20 pt-20 md:pt-0 w-full max-w-full">
  <h1 class="text-5xl f_bebas_neue tracking-[0.2rem] font-bold">Documentation</h1>

	<p class="text-secondary dark:text-gray-200">
		Swapee has a simple REST API that can be used to register accounts and make payments and
		queries.
	</p>

  <h2 class="text-3xl font-semibold f_bebas_neue tracking-[0.2rem]">API Base URL</h2>
  <div class="bg-stone-900 dark:bg-stone-800 text-white rounded-lg p-4 px-5 flex gap-4">
    <div>{api}</div>
    <button class="ml-auto my-auto invert opacity-90" on:click={() => copy(api)}
      ><Icon icon="copy" style="w-10 max-w-none" /></button
    >
  </div>

  <h2 class="text-3xl font-semibold f_bebas_neue tracking-[0.2rem]">Auth Token</h2>
  <p class="text-secondary dark:text-gray-200">
    {#if user && token}
      This token authorizes you to use the API as <b>{user.username}</b>.
    {:else}
      <a href="/login" class="font-bold">Sign in</a> to view your auth token here,
      or get one from the /login endpoint.
    {/if}

    Save it in a variable called <b>$token</b> to run the examples.
  </p>

  <div class="bg-stone-900 dark:bg-stone-800 text-white rounded-lg p-4 px-5 flex gap-4">
    <div class="w-full break-all">{tokenSample}</div>
    <button
      class="ml-auto my-auto invert opacity-90"
      on:click={() => copy(tokenSample)}
      ><Icon icon="copy" style="w-10 max-w-none" /></button
    >
  </div>

  <h2 class="text-3xl font-semibold f_bebas_neue tracking-[0.2rem]">POST /register</h2>
  <p class="text-secondary dark:text-gray-200">
    Register a new user account with a username and password
  </p>
  <Code sample="register" />

  <h2 class="text-3xl font-semibold f_bebas_neue tracking-[0.2rem]">POST /login</h2>
  <p class="text-secondary dark:text-gray-200">Login to an account to get its auth token</p>
  <Code sample="login" />

  <h2 class="text-3xl font-semibold f_bebas_neue tracking-[0.2rem]">POST /invoice</h2>
  <p class="text-secondary dark:text-gray-200">Create an invoice.</p>

  <div class="text-secondary dark:text-gray-200">
    <div>Request params</div>
    <div class="grid grid-cols-3 ml-2">
      <div class="font-bold">type</div>
      <div class="col-span-2">bitcoin or lightning</div>
      <div class="font-bold">amount</div>
      <div class="col-span-2">amount in satoshis</div>
      <div class="font-bold">webhook</div>
      <div class="col-span-2">
        (optional) endpoint to hit when the invoice is paid
      </div>
      <div class="font-bold">secret</div>
      <div class="col-span-2">a secret for the webhook to check</div>
    </div>
  </div>

  <p>Get a lightning invoice to receive funds</p>
  <Code sample="lightningInvoice" />

  <p>Get a bitcoin address to receive funds</p>
  <Code sample="bitcoinAddress" />

  <p>Sample response</p>
  <Code sample="invoiceResponse" />
  <p>You can check the <b>received</b> field to see how much has been paid</p>

  <p>Specify a webhook to be called when an invoice is paid</p>
  <Code sample="webhook" />

  <h2 class="text-3xl font-semibold f_bebas_neue tracking-[0.2rem]">GET /invoice/:hash</h2>
  <p class="text-secondary dark:text-gray-200">
    Fetch an invoice by passing a bitcoin address or lightning payment hash
  </p>
  <Code sample="fetchInvoice" />

  <h2 class="text-3xl font-semibold f_bebas_neue tracking-[0.2rem]">POST /payments</h2>
  <p class="text-secondary dark:text-gray-200">Send a lightning payment</p>
  <Code sample="lightning" />

  <p class="text-secondary dark:text-gray-200">Send a bitcoin payment</p>
  <Code sample="bitcoin" />

  <p class="text-secondary dark:text-gray-200">Send an internal payment to another user</p>
  <Code sample="internal" />

  <h2 class="text-3xl font-semibold f_bebas_neue tracking-[0.2rem]">GET /payments</h2>
  <p class="text-secondary dark:text-gray-200">
    Get all payments sent or received by the current user
  </p>

  <div class="text-secondary dark:text-gray-200">
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
</div>

<style>
  h2 + p {
    margin-top: 0.75rem !important;
  }

  h2 {
    display: inline-block;
    position: relative;
  }

  h2::after{
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
    left: 50%;
    height: 3px;
    border-radius: 2px;
    background: #7105f3;
    transform: translateX(-50%);
}
</style>