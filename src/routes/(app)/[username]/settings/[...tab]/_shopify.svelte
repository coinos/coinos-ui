<script>
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
  import { page } from "$app/stores";

  export let user;
  $: paymentsUrl =
    user.shopifyStore &&
    "https://admin.shopify.com/store/" +
      user.shopifyStore +
      "/settings/payments";
  $: checkoutUrl =
    user.shopifyStore &&
    "https://admin.shopify.com/store/" +
      user.shopifyStore +
      "/settings/checkout";
  $: appsUrl =
    user.shopifyStore &&
    "https://admin.shopify.com/store/" +
      user.shopifyStore +
      "/settings/apps/development";

  let script = `<script src="${$page.url.protocol}//${$page.url.host}/${user.username}/shopify.js"><\/script>`;
</script>

<div>
  <label for="shopifyStore" class="font-bold mb-1 block">Store ID</label>
  <div class="flex mb-2">
    <div
      class="text-gray-600 p-4 my-auto bg-gray-100 border rounded-l-2xl border-r-0 pr-1"
    >admin.shopify.com/store/</div>
    <input
      type="text"
      name="shopifyStore"
      bind:value={user.shopifyStore}
      class="border-l-0 rounded-l-none w-auto min-w-0 pl-1 grow"
    />
  </div>
  <p class="text-secondary my-2">
    Add Bitcoin under <a
      class:active={!!paymentsUrl}
      href={paymentsUrl || undefined}>Payments > Manual payment methods</a
    > with a description like "Pay with Bitcoin".
  </p>
</div>

<div>
  <label for="display" class="font-bold mb-1 block">Additional scripts</label>
  <p class="text-secondary my-2">
    Copy this into <a class:active={!!paymentsUrl} href={checkoutUrl}
      >Checkout -> Additional scripts</a
    >
  </p>
  <textarea rows={5} type="text" name="shopifyScripts" readonly
    >{script}</textarea
  >
</div>

<div>
  <label for="shopifyToken" class="font-bold mb-1 block"
    >Admin API token <span class="font-normal">(Optional)</span></label
  >
  <p class="text-secondary my-2">
    Coinos can automatically mark orders as Paid if you provide an API token.
    <input
      class="my-4"
      type="text"
      name="shopifyToken"
      bind:value={user.shopifyToken}
    />
  </p>
  <p class="text-secondary my-2">
    Create a new app in <a class:active={!!appsUrl} href={appsUrl || undefined}
      >Apps > App Development</a
    >
  </p>

  <p class="text-secondary my-2">
    Edit the Admin API scopes to enable <code class="text-black"
      >write_orders</code
    > permission then install the app into your store and copy the Admin API access
    token here.
  </p>
</div>

<style>
  .active {
    @apply text-blue-500;
  }
</style>
