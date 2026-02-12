<script lang="ts">
  import { PUBLIC_RECAPTCHA_SITE_KEY } from "$env/static/public";
  import { browser } from "$app/environment";
  import handler from "$lib/handler";
  import { applyAction, deserialize } from "$app/forms";
  import { onDestroy, onMount, tick } from "svelte";
  import { fly } from "svelte/transition";
  import { enhance } from "$app/forms";
  import Pinpad from "$comp/Pinpad.svelte";
  import PasswordInput from "$comp/PasswordInput.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import { focus, fail } from "$lib/utils";
  import { password, signer, pin, loginRedirect } from "$lib/store";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";
  import { sign } from "$lib/nostr";
  import { invalidateAll } from "$app/navigation";
  import { sha256 } from "@noble/hashes/sha2.js";
  import { bytesToHex } from "@noble/hashes/utils.js";

  let { data, form }: any = $props();

  onMount(() => {
    if (browser) {
      setTimeout(() => {
        password.set(undefined);
        pin?.set(undefined);
        signer.set(undefined);
        localStorage.clear();
        sessionStorage.clear();
      }, 50);
    }
  });

  onMount(() => {
    let lang = $page.url.searchParams.get("lang");
    if (lang) document.cookie = `lang=${lang} ;`;
  });

  let { challenge } = $derived(data);
  let recaptchaSiteKey = PUBLIC_RECAPTCHA_SITE_KEY;
  let isTor = browser && location.hostname.endsWith(".onion");
  let token = $state("");

  onMount(() => {
    if (!isTor && recaptchaSiteKey) {
      let s = document.createElement("script");
      s.src = "https://www.google.com/recaptcha/api.js?render=" + recaptchaSiteKey;
      document.head.appendChild(s);
    }
  });

  let cancel: any = () => {
    need2fa = false;
  };

  let username: string | undefined = $state(),
    email: any,
    btn: HTMLButtonElement = $state() as any;

  $effect(() => {
    if (form) ({ username, password: $password } = form);
  });
  let need2fa = $derived(form?.message === "2fa");
  $effect(() => {
    if (need2fa && form?.token === token) token = "";
  });

  let revealPassword = $state(false);

  const getRecaptchaToken = () =>
    new Promise((resolve, reject) => {
      if (isTor || !recaptchaSiteKey) return resolve("");
      if (!browser || !grecaptcha) return reject(new Error("captcha unavailable"));
      grecaptcha.ready(() => {
        grecaptcha.execute(recaptchaSiteKey, { action: "login" }).then(resolve).catch(reject);
      });
    });

  const enhanceLogin = async ({ formData, cancel }: any) => {
    try {
      const recaptcha = await getRecaptchaToken();
      formData.set("recaptcha", recaptcha as string);
    } catch (err: any) {
      fail(err.message || "captcha failed");
      cancel();
      return;
    }

    return async ({ result }: any) => {
      if (result.type === "success") {
        await invalidateAll();
      }

      applyAction(result);
    };
  };

  $effect(() => {
    token?.length === 6 &&
      tick().then(() => {
        btn.click();
      });
  });

  let redirect = $derived($loginRedirect || $page.url.searchParams.get("redirect"));

  let nostrLogin = async () => {
    let event = {
      kind: 27235,
      created_at: Date.now(),
      content: "",
      tags: [
        ["u", `${$page.url.origin}/api/nostrAuth`],
        ["method", "POST"],
        ["challenge", challenge],
      ],
    };

    let signedEvent = await sign(event);

    const formData = new FormData();

    try {
      const recaptcha = await getRecaptchaToken();
      formData.append("loginRedirect", (redirect ?? "") as string);
      formData.append("token", token ?? "");
      formData.append("event", JSON.stringify(signedEvent));
      formData.append("challenge", challenge);
      formData.append("recaptcha", recaptcha as string);

      let response = await fetch("/login?/nostr", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text());

      applyAction(result);
    } catch (e: any) {
      fail(e.message);
    }
  };

  onDestroy(() => {
    if (!browser) return;
    const nodeBadge = document.querySelector(".grecaptcha-badge");
    if (nodeBadge) {
      document.body.removeChild(nodeBadge.parentNode!);
    }

    const scriptSelector =
      "script[src='https://www.google.com/recaptcha/api.js?render=" + recaptchaSiteKey + "']";
    const script = document.querySelector(scriptSelector);
    if (script) {
      script.remove();
    }
  });
</script>

<div class="mx-auto md:shadow-xl rounded-3xl max-w-xl w-full md:w-[480px] md:p-8 mb-20 space-y-5">
  <h1 class="text-2xl font-bold text-center">{$t("login.signIn")}</h1>
  {#if form?.error && !form?.message.includes("2fa")}
    <div class="text-red-600 text-center" in:fly>{form.error}</div>
  {/if}

  <form use:enhance={enhanceLogin} class="space-y-5" method="POST" action="?/login">
    <input type="hidden" name="loginRedirect" value={redirect} />
    <input type="hidden" name="token" value={token} />

    <input
      name="username"
      data-testid="login-username"
      type="text"
      required
      bind:value={username}
      use:focus
      autocapitalize="none"
      placeholder={$t("login.username")}
    />

    <PasswordInput bind:value={$password} placeholder={$t("login.password")} />

    <div class="flex justify-end items-center">
      <a href="/forgot" class="underline underline-offset-4 text-secondary">
        {$t("login.forgotUserOrPassword")}
      </a>
    </div>

    <button type="submit" class="btn btn-accent" bind:this={btn} data-testid="login-submit">
      {$t("login.signIn")}
    </button>

    <button type="button" class="btn" onclick={nostrLogin}>
      {#if $signer?.ready}
        <div class="shrink">
          <Spinner />
        </div>
      {:else}
        <img src="/images/nostr.png" class="w-8" alt="Nostr" />
      {/if}
      <div class="my-auto">{$t("login.nostr")}</div>
    </button>

    <p class="text-secondary text-center font-medium">
      {$t("login.noAccount")}
      <a
        href={"/register" + $page.url.search}
        class="block md:inline text-secondary underline underline-offset-4 hover:opacity-80"
      >
        {$t("login.register")}
      </a>
    </p>
  </form>
</div>

{#if need2fa && token.length < 6}
  <div
    class="fixed bg-base-100/90 inset-0 h-full w-full z-50 cursor-default"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
    role="dialog"
    aria-labelledby="title"
    tabindex="-1"
  >
    <div class="mx-auto p-5 border shadow-lg rounded-md bg-base-100 space-y-5 max-w-lg">
      <h1 id="title" class="text-center text-2xl font-semibold">2FA</h1>
      <Pinpad bind:v={token} {cancel} />

      <div class="w-full flex">
        <button class="btn" onclick={cancel}>
          <div class="my-auto">Cancel</div>
        </button>
      </div>
    </div>
  </div>
{/if}
