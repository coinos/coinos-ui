<script>
  import { PUBLIC_RECAPTCHA_SITE_KEY } from "$env/static/public";
  import { browser } from "$app/environment";
  import { onDestroy, onMount, tick } from "svelte";
  import { t } from "$lib/translations";
  import PasswordInput from "$comp/PasswordInput.svelte";
  import Icon from "$comp/Icon.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { fly } from "svelte/transition";
  import { password } from "$lib/store";
  import { fail } from "$lib/utils";

  let { form } = $props();
  let email;
  let loading;
  let recaptchaToken = "";
  let recaptchaSiteKey = PUBLIC_RECAPTCHA_SITE_KEY;
  let isTor = browser && location.hostname.endsWith(".onion");

  onMount(() => {
    if (!isTor && recaptchaSiteKey) {
      let s = document.createElement("script");
      s.src = "https://www.google.com/recaptcha/api.js?render=" + recaptchaSiteKey;
      document.head.appendChild(s);
    }
  });

  const getRecaptchaToken = () =>
    new Promise((resolve, reject) => {
      if (isTor) return resolve("");
      if (!browser || !grecaptcha) return reject(new Error("captcha unavailable"));
      grecaptcha.ready(() => {
        grecaptcha
          .execute(recaptchaSiteKey, { action: "reset" })
          .then(resolve)
          .catch(reject);
      });
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    loading = true;
    try {
      recaptchaToken = await getRecaptchaToken();
      await tick();
      e.currentTarget.submit();
    } catch (err) {
      fail(err.message || "captcha failed");
      loading = false;
    }
  };

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

<div class="pt-10">
  <div class="w-[243px] mx-auto mb-10">
    <a href="/">
      <Icon icon="logo" />
    </a>
  </div>

  <div class="flex justify-center items-center">
    <div
      class="shadow-xl rounded-3xl p-10 pb-12 space-y-5 w-full mx-5 md:mx-0 md:w-[400px]"
    >
      <h1 class="text-2xl font-bold text-center">{$t("login.reset")}</h1>

      {#if form?.error}
        <div class="text-red-600 text-center" in:fly>
          {form.error}
        </div>
      {/if}

      <form class="space-y-5" method="POST" onsubmit={handleSubmit}>
        <input type="hidden" name="recaptcha" value={recaptchaToken} />
        <PasswordInput
          bind:value={$password}
          placeholder={$t("login.password")}
        />

        <div class="text-secondary">
          A new seed phrase will be generated for your account. You'll need to
          import your old seed phrase if you want to use the same nostr profile
          and savings account as before.
        </div>

        <button
          type="submit"
          class="bg-black text-white w-full rounded-2xl p-4 font-semibold hover:opacity-80"
          disabled={loading}
        >
          {#if loading}
            <Spinner />
          {:else}
            {$t("login.submit")}
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>
