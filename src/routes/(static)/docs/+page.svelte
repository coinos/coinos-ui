<script>
  import { copyNoNewlines as copy } from "$lib/utils";
  import { PUBLIC_DOMAIN, PUBLIC_COINOS_URL } from "$env/static/public";

  import Code from "$comp/Code.svelte";
  import Icon from "$comp/Icon.svelte";

  let { data } = $props();

  let { user, token } = data;

  let api = PUBLIC_DOMAIN.includes("localhost")
    ? `${PUBLIC_COINOS_URL}`
    : `https://${PUBLIC_DOMAIN}/api`;

  let tokenSample = token
    ? `export token="${token}"`
    : `export token=<your auth token>`;
</script>

{#snippet cp(something)}
  <button type="button" class="ml-auto" onclick={() => copy(something)}>
    <iconify-icon icon="ph:copy-bold" width="42"></iconify-icon>
  </button>
{/snippet}

<div class="space-y-8 lg:text-xl mt-20 pt-20 md:pt-0 w-full max-w-full">
  <h1 class="text-4xl">Documentation</h1>

  <p class="text-secondary">
    Coinos is free and open source software. The code is available at <a
      href="https://github.com/coinos"
      class="text-secondary underline">github.com/coinos</a
    >
  </p>

  <p class="text-secondary">
    Coinos has a REST API that can be used to register accounts and make
    payments. The following examples show how you can call the API with <a
      href="https://curl.se/"
      class="text-secondary underline">curl</a
    >
  </p>

  <h2 class="text-2xl">API Base URL</h2>
  <div
    class="bg-primary text-primary-content rounded-lg p-4 flex gap-4 items-center"
  >
    <div>{api}</div>
    {@render cp(api)}
  </div>

  <h2 class="text-2xl">Auth Token</h2>
  <p class="text-secondary">
    {#if user && token}
      This token authorizes you to use the API as <b>{user.username}</b>.
    {:else}
      <a href="/login" class="font-bold">Sign in</a> to view your auth token here,
      or get one from the /login endpoint.
    {/if}

    Save it in a variable called <b>$token</b> to run the examples.
  </p>

  <div
    class="bg-primary text-primary-content rounded-lg p-4 flex gap-4 items-center"
  >
    <div class="w-full break-all">{tokenSample}</div>
    {@render cp(tokenSample)}
  </div>

  <h2 class="text-2xl">POST /register</h2>
  <p class="text-secondary">
    Register a new user account with a username and password
  </p>
  <Code sample="register" />

  <h2 class="text-2xl">POST /login</h2>
  <p class="text-secondary">Login to an account to get its auth token</p>
  <Code sample="login" />

  <h2 class="text-2xl">GET /me</h2>
  <p class="text-secondary">Get your account details and balance</p>
  <Code sample="me" />

  <h2 class="text-2xl">POST /user</h2>
  <p class="text-secondary">Update your account/settings</p>
  <div>Request params (all optional)</div>
  <div class="grid grid-cols-3 ml-2">
    <div class="font-bold">username</div>
    <div class="col-span-2">string - letters and numbers, no spaces</div>
    <div class="font-bold">display</div>
    <div class="col-span-2">string - spaces allowed</div>
    <div class="font-bold">currency</div>
    <div class="col-span-2">string - three-letter ISO currency code e.g. CAD or USD</div>
    <div class="font-bold">language</div>
    <div class="col-span-2">string - two-letter language code e.g. en, fr, es</div>
  </div>

  <Code sample="update" />

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

  <h2 class="text-2xl">GET /invoice/:hash</h2>
  <p class="text-secondary">
    Fetch an invoice by passing a bitcoin address or lightning payment hash
  </p>
  <Code sample="fetchInvoice" />

  <h2 class="text-2xl">POST /payments</h2>
  <p class="text-secondary">Send a lightning payment</p>
  <Code sample="lightning" />

  <p class="text-secondary">Send an internal payment to another user</p>
  <Code sample="internal" />

  <h2 class="text-2xl">POST /bitcoin/send</h2>
  <p class="text-secondary">Send a bitcoin payment</p>
  <Code sample="bitcoin" />

  <h2 class="text-2xl">GET /payments</h2>
  <p class="text-secondary">
    Get all payments sent or received by the current user
  </p>

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
</div>
