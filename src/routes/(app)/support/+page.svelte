<script>
  import { onDestroy } from "svelte";
  import { fail, success, post } from "$lib/utils";
  import { scale } from "svelte/transition";
  import AppHeader from "$comp/AppHeader.svelte";
  import Icon from "$comp/Icon.svelte";
  import { t } from "$lib/translations";

  export let data;

  let { user } = data;
  $: if (user) {
    data.subject = { ...user };
  }

	let email;
	let message;
	let sent;
	let recaptchaSiteKey = '6LdrWqwoAAAAAIv4ls-UV9zT5EzSqyqw28q1Eqe0';

  let submit = (e) => {
    e.preventDefault();
    grecaptcha.ready(() => {
      grecaptcha.execute(recaptchaSiteKey, { action: "submit" }).then((token) =>
        post("/support", { username: user?.username, email, message, token })
          .then(() => (sent = true))
          .catch(() => fail("problem submitting"))
      );
    });
  };

	onDestroy(() => {
    if (!document) return;
		const nodeBadge = document.querySelector('.grecaptcha-badge');
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

<svelte:head>
	<script
		src="https://www.google.com/recaptcha/api.js?render=6LdrWqwoAAAAAIv4ls-UV9zT5EzSqyqw28q1Eqe0"
	></script>
</svelte:head>

{#if user}
  <AppHeader {data} />
{/if}

<div class="container px-4 max-w-lg mx-auto mt-24 space-y-8">
  {#if sent}
    <h1 class="text-center text-3xl md:text-4xl font-semibold">Thank you!</h1>
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
    <h1 class="text-center text-4xl md:text-5xl font-semibold mb-8 font-bebasNeue tracking-[0.2rem]">
      {$t("user.support.header")}
    </h1>

		<p class="text-secondary dark:text-gray-200 text-lg">
			Fill out this form or email us directly at <a
				class="underline"
				href="mailto:support@swapee.me">support@swapee.me</a
			> and we'll do our best to get back to you in a timely manner.
		</p>

    <form on:submit={submit}>
      <div class="mb-6">
        <label for="account" class="font-semibold"
          >{$t("user.support.accountName")}</label
        >
        <input
          class="input-swapee mt-3"
          type="text"
          name="account"
          required
          value={user?.username || ""}
        />
      </div>

      <div class="mb-6">
        <label for="email" class="font-semibold"
          >{$t("user.support.email")}</label
        >
        <input
          class="input-swapee mt-3"
          type="email"
          name="email"
          bind:value={email}
          required
        />
      </div>

      <div class="mb-6">
        <label for="message" class="font-semibold"
          >{$t("user.support.message")}</label
        >
        <textarea
          rows={5}
          class="input-swapee mt-3"
          type="text"
          name="message"
          bind:value={message}
          required
        />
      </div>

      <button
        type="submit"
        disabled={!email || !message}
        class="g-recaptcha {!email || !message
          ? 'opacity-50'
          : 'opacity-100'} bg-black dark:bg-swapee-purple text-white font-bold rounded-xl py-3 w-full mx-auto {email &&
        message
          ? 'hover:opacity-80'
          : ''}">{$t("user.support.send")}</button
      >
    </form>
  {/if}
</div>
