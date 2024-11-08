<script>
  import { run } from 'svelte/legacy';

  import { browser } from "$app/environment";
  import { onDestroy } from "svelte";
  import { fail, success, post } from "$lib/utils";
  import { scale } from "svelte/transition";
  import Icon from "$comp/Icon.svelte";
  import { t } from "$lib/translations";

  let { data = $bindable() } = $props();

  let { user } = data;
  run(() => {
    if (user) {
      data.subject = { ...user };
    }
  });

  let email = $state();
  let message = $state();
  let sent = $state();
  let recaptchaSiteKey = "6LfCd8YkAAAAANmVJgzN3SQY3n3fv1RhiS5PgMYM";

  let submit = (e) => {
    e.preventDefault();
    grecaptcha.ready(() => {
      grecaptcha.execute(recaptchaSiteKey, { action: "submit" }).then((token) =>
        post("/support", { username: user?.username, email, message, token })
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

<svelte:head
  ><script
    src="https://www.google.com/recaptcha/api.js?render=6LfCd8YkAAAAANmVJgzN3SQY3n3fv1RhiS5PgMYM"
  ></script></svelte:head
>

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
      Fill out this form or email us directly at <a
        class="underline"
        href="mailto:support@coinos.io">support@coinos.io</a
      > and we'll do our best to get back to you in a timely manner.
    </p>

    <form onsubmit={submit}>
      <div class="mb-4">
        <label for="account" class="font-semibold"
          >{$t("user.support.accountName")}</label
        >
        <input
          type="text"
          name="account"
          required
          value={user?.username || ""}
        />
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
