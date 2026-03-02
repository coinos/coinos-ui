<script lang="ts">
  import { PUBLIC_RECAPTCHA_SITE_KEY } from "$env/static/public";
  import { onDestroy, onMount } from "svelte";
  import { browser } from "$app/environment";
  import punks from "$lib/punks";
  import { upload } from "$lib/upload";
  import { invalidateAll } from "$app/navigation";
  import { applyAction, deserialize } from "$app/forms";
  import { tick } from "svelte";
  import { fly } from "svelte/transition";

  import Pin from "$comp/Pin.svelte";
  import PasswordInput from "$comp/PasswordInput.svelte";
  import Spinner from "$comp/Spinner.svelte";

  import { fail, focus, post } from "$lib/utils";
  import { registerPasskey } from "$lib/passkey";
  import { rememberPrfKey, defaultRememberForMs } from "$lib/passwordCache";
  import { avatar, signer, password, pin, loginRedirect } from "$lib/store";
  import {
    generateCanonicalKey,
    wrapCanonicalKey,
    saveEncryptedKeys,
    resolveCanonicalKey,
    passwordMethodId,
    passkeyMethodId,
    nostrMethodId,
  } from "$lib/keyWrapping";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";
  import { sign } from "$lib/nostr";

  let { form, data }: any = $props();
  let { challenge, username } = $derived(data);
  let index = $derived(Number($page.url.searchParams.get("index") || "1"));
  let recaptchaSiteKey = PUBLIC_RECAPTCHA_SITE_KEY;
  let isTor = browser && location.hostname.endsWith(".onion");

  onMount(() => {
    if (!isTor && recaptchaSiteKey) {
      let s = document.createElement("script");
      s.src = "https://www.google.com/recaptcha/api.js?render=" + recaptchaSiteKey;
      document.head.appendChild(s);
    }
  });

  onMount(() => {
    if (browser) {
      setTimeout(() => {
        password.set(undefined);
        pin.set(undefined);
        signer.set(undefined);
        const installDismissed = localStorage.getItem("installDismissed");
        const snapshots: [string, string][] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)!;
          if (k.startsWith("arkVaultSnapshot:")) snapshots.push([k, localStorage.getItem(k)!]);
        }
        localStorage.clear();
        if (installDismissed) localStorage.setItem("installDismissed", installDismissed);
        for (const [k, v] of snapshots) localStorage.setItem(k, v);
        sessionStorage.clear();
      }, 50);
    }
  });

  let token: string = $state(""),
    formElement: any;
  let redirect: any = $derived($loginRedirect || $page.url.searchParams.get("redirect"));

  let cancel: any = () => {
    need2fa = false;
  };

  let btn: HTMLButtonElement = $state() as any;

  let loading = $state(false);
  let passkeyLoading = $state(false);

  const getRecaptchaToken = () =>
    new Promise((resolve, reject) => {
      if (isTor || !recaptchaSiteKey) return resolve("");
      if (!browser || !grecaptcha) return reject(new Error("captcha unavailable"));
      grecaptcha.ready(() => {
        grecaptcha.execute(recaptchaSiteKey, { action: "register" }).then(resolve).catch(reject);
      });
    });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    loading = true;

    let data = new FormData(e.target as HTMLFormElement);
    let user: Record<string, any> = Object.fromEntries(data);
    user.username = username.replace(/\s*/g, "");

    if (!user.password) {
      fail("Password is required");
      loading = false;
      return;
    }

    for (let k in user) {
      data.set(k, user[k]);
    }

    try {
      const recaptcha = await getRecaptchaToken();
      data.set("recaptcha", recaptcha as string);
    } catch (err: any) {
      fail(err.message || "captcha failed");
      loading = false;
      return;
    }

    data.set("picture", `${$page.url.origin}/api/public/${punks[index]}.webp`);
    if ($avatar) {
      try {
        let { hash } = JSON.parse(
          (await upload(
            ($avatar as any).file,
            ($avatar as any).type,
            ($avatar as any).progress,
          )) as string,
        );

        let url = `${$page.url.origin}/api/public/${hash}.webp`;
        data.set("picture", url);
        await fetch(url, {
          cache: "reload",
          mode: "no-cors",
        });
      } catch (e) {
        console.log("problem uploading avatar", e);
      }
    }

    // Derive authPubkey from username + password
    try {
      const { deriveAuthKeypair } = await import("$lib/deriveAuthKey");
      const { pubkey: authPubkey } = await deriveAuthKeypair(user.username, user.password);
      data.set("authPubkey", authPubkey);
    } catch (e) {
      console.log("Failed to derive authPubkey during registration", e);
    }

    const response = await fetch("/register/auth?/register", {
      method: "POST",
      body: data,
    });

    const result = deserialize(await response.text());

    if (result.type === "success" || result.type === "redirect") {
      try {
        const { deriveAuthKeypair } = await import("$lib/deriveAuthKey");
        const { sk } = await deriveAuthKeypair(user.username, user.password);
        const canonicalKey = generateCanonicalKey();
        const wrapped = await wrapCanonicalKey(sk.buffer as ArrayBuffer, canonicalKey);
        rememberPrfKey(canonicalKey, defaultRememberForMs);

        const encryptedKeys = { [passwordMethodId()]: wrapped };
        let nostrPubkey: string | undefined;
        try {
          const { deriveNostrKey } = await import("$lib/seed");
          const { nip19 } = await import("nostr-tools");
          const nostr = await deriveNostrKey(canonicalKey);
          localStorage.setItem("nsec", nip19.nsecEncode(nostr.sk));
          nostrPubkey = nostr.pubkey;
        } catch (e) {
          console.log("Nostr key derivation failed", e);
        }

        await post("/post/user", nostrPubkey ? { encryptedKeys, pubkey: nostrPubkey } : { encryptedKeys });
      } catch (e) {
        console.log("Canonical key generation failed", e);
      }

      await invalidateAll();
    }

    applyAction(result);
    loading = false;
  }

  let passkeyRegister = async () => {
    passkeyLoading = true;
    let passkeyToken: string | null = null;
    try {
      let pw = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");

      const recaptcha = await getRecaptchaToken();

      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", pw);
      formData.append("challenge", challenge);
      formData.append("recaptcha", recaptcha as string);
      formData.append("picture", `${$page.url.origin}/api/public/${punks[index]}.webp`);

      const response = await fetch("/register/auth?/passkeyCreate", {
        method: "POST",
        body: formData,
      });

      const result: any = deserialize(await response.text());
      if (result.type !== "success") {
        fail(result.data?.error || "Account creation failed");
        passkeyLoading = false;
        return;
      }

      passkeyToken = result.data.token;
      const passkeySk = result.data.sk;

      const { prfKey, credentialId } = await registerPasskey(passkeyToken!);

      // Generate canonical key and derive nostr key before activate
      // so we can pass the pubkey to the server-side activate action
      const canonicalKey = generateCanonicalKey();
      let nostrPubkey: string | undefined;
      let nostrSk: Uint8Array | undefined;
      try {
        const { deriveNostrKey } = await import("$lib/seed");
        const nostr = await deriveNostrKey(canonicalKey);
        nostrPubkey = nostr.pubkey;
        nostrSk = nostr.sk;
      } catch (e) {
        console.log("Nostr key derivation failed", e);
      }

      const activateData = new FormData();
      activateData.append("token", passkeyToken!);
      activateData.append("username", username);
      if (passkeySk) activateData.append("sk", passkeySk);
      if (nostrPubkey) activateData.append("pubkey", nostrPubkey);
      activateData.append("loginRedirect", (redirect ?? "") as string);

      const activateResponse = await fetch("/register/auth?/activate", {
        method: "POST",
        body: activateData,
      });

      const activateResult = deserialize(await activateResponse.text());

      if (activateResult.type === "success" || activateResult.type === "redirect") {
        try {
          const wrapped = await wrapCanonicalKey(prfKey, canonicalKey);
          await saveEncryptedKeys({ [passkeyMethodId(credentialId)]: wrapped });
          rememberPrfKey(canonicalKey, defaultRememberForMs);

          if (nostrSk) {
            const { nip19 } = await import("nostr-tools");
            localStorage.setItem("nsec", nip19.nsecEncode(nostrSk));
          }
        } catch (e) {
          console.log("Canonical key generation failed", e);
        }
        await invalidateAll();
      }

      applyAction(activateResult);
    } catch (e: any) {
      // Clean up the account created by passkeyCreate if passkey registration failed
      if (passkeyToken) {
        try {
          await fetch("/post/user/delete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${passkeyToken}`,
            },
            body: JSON.stringify({}),
          });
        } catch {}
      }
      if (e.name !== "NotAllowedError") {
        fail(e.message || "Passkey registration failed");
      }
    }
    passkeyLoading = false;
  };

  let need2fa: any = $derived(form?.message === "2fa");

  let src: string = $derived(
    $avatar ? URL.createObjectURL(($avatar as any).file) : `/api/public/${punks[index]}.webp`,
  );

  $effect(() => {
    if (need2fa && form?.token === token) token = "";
  });

  $effect(() => {
    token && token.length === 6 && tick().then(() => btn.click());
  });

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
      formData.append("loginRedirect", redirect ?? "");
      formData.append("token", token ?? "");
      formData.append("event", JSON.stringify(signedEvent));
      formData.append("challenge", challenge);
      formData.append("recaptcha", recaptcha as string);

      let response = await fetch("/login?/nostr", {
        method: "POST",
        body: formData,
      });

      const result: any = deserialize(await response.text());

      if (result.type === "success" || result.type === "redirect") {
        try {
          const { deriveNostrEntropy } = await import("$lib/walletEntropy");
          const oldPrfKey = await deriveNostrEntropy();
          await resolveCanonicalKey(
            nostrMethodId(signedEvent.pubkey),
            oldPrfKey,
            result.data?.encryptedKeys,
            oldPrfKey,
          );
        } catch (e) {
          console.log("Nostr canonical key resolution failed", e);
        }
        await invalidateAll();
      }

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

{#if need2fa}
  <Pin bind:value={token} title={$t("login.enter2faCode")} {cancel} notify={false} />
{/if}

<div class="mx-auto md:shadow-xl rounded-3xl max-w-xl w-full md:w-[480px] md:p-8 space-y-5 mb-20">
  <h1 class="text-2xl font-bold text-center">{$t("login.createAccount")}</h1>

  <div class="flex flex-col items-center gap-2">
    <div class="w-24 h-24 rounded-full overflow-hidden">
      <img {src} class="w-full h-full object-cover" alt={username} />
    </div>
    <span class="text-xl font-bold">{username}</span>
  </div>

  {#if form?.error || form?.message}
    <div class="text-red-600 text-center" in:fly>{form?.message}{form?.error}</div>
  {/if}

  <form class="space-y-5" onsubmit={handleSubmit} method="POST">
    <input
      type="hidden"
      name="loginRedirect"
      value={redirect}
    />
    <input type="hidden" name="token" value={token} />
    <input type="hidden" name="challenge" value={challenge} />
    <input type="hidden" name="username" value={username} />

    <PasswordInput bind:value={$password} placeholder={$t("login.password")} {focus} />

    <button type="submit" class="btn btn-accent" disabled={loading} bind:this={btn}>
      {#if loading}
        <Spinner />
      {:else}
        {$t("login.register")}
      {/if}
    </button>

    <div class="flex items-center gap-3">
      <div class="h-px bg-base-300 flex-1"></div>
      <span class="text-secondary text-lg">or</span>
      <div class="h-px bg-base-300 flex-1"></div>
    </div>

    <button type="button" class="btn" onclick={passkeyRegister} disabled={passkeyLoading}>
      {#if passkeyLoading}
        <Spinner />
      {:else}
        <iconify-icon noobserver icon="ph:fingerprint-bold" width="24"></iconify-icon>
        <div class="my-auto">{$t("login.registerPasskey")}</div>
      {/if}
    </button>

    <button type="button" class="btn" onclick={nostrLogin}>
      {#if $signer?.ready}
        <div class="shrink">
          <Spinner />
        </div>
      {:else}
        <img src="/images/nostr.png" class="w-8" alt="Nostr" />
      {/if}
      <div class="my-auto">{$t("login.registerNostr")}</div>
    </button>

    <p class="text-secondary text-center font-medium">
      {$t("login.haveAccount")}
      <a
        href={"/login" + $page.url.search}
        class="block md:inline text-secondary underline underline-offset-4 hover:opacity-80"
      >
        {$t("login.signIn")}
      </a>
    </p>

    <a href="/register" class="btn btn-ghost gap-2">
      <iconify-icon noobserver icon="ph:arrow-left-bold" width="20"></iconify-icon>
      Back
    </a>
  </form>
</div>
