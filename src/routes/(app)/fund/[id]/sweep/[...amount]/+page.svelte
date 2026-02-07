<script>
  import { PUBLIC_RECAPTCHA_SITE_KEY } from "$env/static/public";
  import { onDestroy, onMount, tick } from "svelte";
  import { browser } from "$app/environment";
  import { enhance } from "$app/forms";
  import { password } from "$lib/store";
  import Success from "$comp/Success.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { t } from "$lib/translations";
  import { loc } from "$lib/utils";

  let { data } = $props();
  let { amount, currency, id, user, rate, rates, needsCaptcha } = $derived(data);
  let locale = $derived(loc(user));

  let recaptchaToken = $state("");
  let formEl = $state();
  let loading = $state(!!needsCaptcha);
  let swept = $state(!needsCaptcha);
  let sweptAmount = $state(amount);
  let sweptUsername = $state(user?.username);
  let recaptchaSiteKey = PUBLIC_RECAPTCHA_SITE_KEY;
  let isTor = browser && location.hostname.endsWith(".onion");

  function handleEnhance() {
    return async ({ result }) => {
      if (result.type === "success") {
        sweptAmount = result.data.amount;
        sweptUsername = result.data.username;
        $password = result.data.password;
        loading = false;
        swept = true;
      }
    };
  }

  onMount(() => {
    if (!needsCaptcha) {
      $password = data.password;
      return;
    }

    if (isTor || !recaptchaSiteKey) {
      recaptchaToken = "";
      tick().then(() => formEl?.requestSubmit());
      return;
    }

    let s = document.createElement("script");
    s.src =
      "https://www.google.com/recaptcha/api.js?render=" + recaptchaSiteKey;
    s.onload = () => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute(recaptchaSiteKey, { action: "register" })
          .then((token) => {
            recaptchaToken = token;
            tick().then(() => formEl?.requestSubmit());
          });
      });
    };
    document.head.appendChild(s);
  });

  onDestroy(() => {
    if (!browser) return;
    const nodeBadge = document.querySelector(".grecaptcha-badge");
    if (nodeBadge) {
      document.body.removeChild(nodeBadge.parentNode);
    }
    const scriptSelector =
      "script[src='https://www.google.com/recaptcha/api.js?render=" +
      recaptchaSiteKey +
      "']";
    const script = document.querySelector(scriptSelector);
    if (script) {
      script.remove();
    }
  });
</script>

{#if loading}
  <div class="flex justify-center items-center h-64">
    <Spinner />
  </div>
  <form method="POST" class="hidden" bind:this={formEl} use:enhance={handleEnhance}>
    <input type="hidden" name="recaptcha" value={recaptchaToken} />
    <input type="hidden" name="amount" value={amount} />
  </form>
{:else if swept}
  <div class="container px-4 text-center mx-auto">
    <Success
      amount={sweptAmount}
      {rate}
      {currency}
      {locale}
      title={$t("payments.received")}
    />
  </div>

  <a href={`/${sweptUsername}`} aria-label="Continue">
    <div class="opacity-0 w-screen h-screen fixed top-24 left-0 z-50"></div>
  </a>

  <div class="flex justify-center mt-4">
    {$t("payments.tapAnywhere")}
  </div>
{/if}
