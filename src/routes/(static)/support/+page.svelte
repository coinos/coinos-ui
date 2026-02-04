<script>
  import { PUBLIC_RECAPTCHA_SITE_KEY } from "$env/static/public";
  import { browser } from "$app/environment";
  import { onDestroy, onMount } from "svelte";
  import { fail, success, post } from "$lib/utils";
  import { scale } from "svelte/transition";
  import Icon from "$comp/Icon.svelte";
  import { t } from "$lib/translations";

  let { data } = $props();
  let user = $derived(data.user);

  let username = $state();
  let email = $state();
  let message = $state();
  let sent = $state();
  let recaptchaSiteKey = PUBLIC_RECAPTCHA_SITE_KEY;
  let isTor = browser && location.hostname.endsWith(".onion");

  $effect(() => {
    if (typeof username === "undefined") username = user?.username;
  });

  onMount(() => {
    if (!isTor && recaptchaSiteKey) {
      let s = document.createElement("script");
      s.src = "https://www.google.com/recaptcha/api.js?render=" + recaptchaSiteKey;
      document.head.appendChild(s);
    }
  });

  let submit = (e) => {
    e.preventDefault();
    if (isTor) {
      post("/post/email", {
        username: user?.username || `${username} (unverified)`,
        email,
        message,
        token: "",
      })
        .then(() => (sent = true))
        .catch(() => fail("problem submitting"));
      return;
    }
    grecaptcha.ready(() => {
      grecaptcha.execute(recaptchaSiteKey, { action: "submit" }).then((token) =>
        post("/post/email", {
          username: user?.username || `${username} (unverified)`,
          email,
          message,
          token,
        })
          .then(() => (sent = true))
          .catch(() => fail("problem submitting")),
      );
    });
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

<div class="container max-w-lg mx-auto space-y-8 p-4 pb-20">
  {#if sent}
    <h1 class="text-center text-3xl lg:text-4xl font-semibold">Thank you!</h1>
    <div class="text-center text-lg text-secondary">
      Someone will be in touch shortly.
    </div>

    <div>
      <a href={user ? `/${user.username}` : "/"}>
        <button
          class="rounded-full border py-2 px-5 font-bold hover:opacity-80 w-full bg-black text-white"
          >Ok</button
        >
      </a>
    </div>
  {:else}
    <h1 class="text-center text-3xl md:text-4xl font-semibold mb-8">
      {$t("user.support.header")}
    </h1>

    <p class="text-secondary text-lg">
      {$t("user.support.fillForm")}
      <a class="underline" href="mailto:support@coinos.io">support@coinos.io</a>
      {$t("user.support.doOurBest")}
    </p>

    <form onsubmit={submit}>
      <div class="mb-4">
        <label for="username" class="font-semibold"
          >{$t("user.support.accountName")}</label
        >
        <input type="text" name="username" required bind:value={username} />
      </div>

      <div class="mb-4">
        <label for="email" class="font-semibold"
          >{$t("user.support.email")}</label
        >
        <input type="email" name="email" bind:value={email} required />
      </div>

      <div class="mb-4">
        <label for="message" class="font-semibold"
          >{$t("user.support.message")}</label
        >
        <textarea
          rows={5}
          type="text"
          name="message"
          bind:value={message}
          required
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={!email || !message}
        class="g-recaptcha bg-black text-white font-bold rounded-xl py-3 w-full mx-auto hover:opacity-80"
        >{$t("user.support.send")}</button
      >
    </form>
  {/if}
</div>
