<script lang="ts">
  import { PUBLIC_RECAPTCHA_SITE_KEY } from "$env/static/public";
  import { onDestroy, onMount } from "svelte";
  import { browser } from "$app/environment";
  import punks from "$lib/punks";
  import { upload } from "$lib/upload";
  import { afterNavigate, invalidateAll } from "$app/navigation";
  import { applyAction, deserialize } from "$app/forms";
  import { tick } from "svelte";
  import { fly } from "svelte/transition";
  import { enhance } from "$app/forms";

  import Pin from "$comp/Pin.svelte";
  import Spinner from "$comp/Spinner.svelte";

  import { focus, fail, versions, post } from "$lib/utils";
  import { registerPasskey, loginWithPasskey } from "$lib/passkey";
  import { rememberPrfKey, defaultRememberForMs } from "$lib/passwordCache";
  import { avatar, signer, password, pin, loginRedirect } from "$lib/store";
  import { t } from "$lib/translations";
  import { page } from "$app/stores";
  import { NumberDictionary, uniqueNamesGenerator, animals } from "unique-names-generator";
  import { sign } from "$lib/nostr";

  let { form, data }: any = $props();
  let { challenge } = $derived(data);
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
        localStorage.clear();
        sessionStorage.clear();
      }, 50);
    }
  });

  let username: string | undefined = $state();
  let index = $state(data.index);
  let needsPasskey = $state(false);

  // Stored between handleSubmit and retryPasskey
  let pendingToken: string | undefined;

  let cleared;
  let clear = () => {
    if (!cleared) {
      cleared = true;
      username = "";
    }
  };

  let refresh = async (e: any) => {
    e.preventDefault();
    cleared = false;

    username = uniqueNamesGenerator({
      dictionaries: [animals, NumberDictionary.generate({ min: 10, max: 99 })],
      length: 2,
      separator: "",
    });
  };

  afterNavigate(async () => {
    try {
      await invalidateAll();
    } catch (e) {
      console.log(e);
    }
  });

  let token: string = $state(""),
    formElement: any;
  let code: any[] = [];
  let redirect: any;

  let cancel: any = () => {
    need2fa = false;
  };

  let email: any,
    btn: HTMLButtonElement = $state() as any;

  let loading = $state(false);
  const getRecaptchaToken = () =>
    new Promise((resolve, reject) => {
      if (isTor) return resolve("");
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
    user.username = (user.username as string).replace(/\s*/g, "");

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

    const response = await fetch("/register?/register", {
      method: "POST",
      body: data,
    });

    const result = deserialize(await response.text());

    if (result.type === "success") {
      // User created but no cookies set yet — must complete passkey first
      const { token } = (result as any).data;
      pendingToken = token;

      let prfKey: ArrayBuffer;
      try {
        prfKey = await registerPasskey(pendingToken);
      } catch (e: any) {
        console.log("passkey creation cancelled or failed", e);
        needsPasskey = true;
        loading = false;
        return;
      }

      await activateSession(prfKey);
    } else {
      // Registration failed (e.g. username taken) — try passkey sign-in
      try {
        const { credential, challengeId, prfKey } = await loginWithPasskey();
        const loginData = new FormData();
        loginData.append("credential", JSON.stringify(credential));
        loginData.append("challengeId", challengeId);
        loginData.append("loginRedirect", (redirect ?? "") as string);

        const loginResponse = await fetch("/login?/passkey", {
          method: "POST",
          body: loginData,
        });

        const loginResult = deserialize(await loginResponse.text());

        if (loginResult.type === "success" || loginResult.type === "redirect") {
          rememberPrfKey(prfKey, defaultRememberForMs);
          await invalidateAll();
          applyAction(loginResult);
          loading = false;
          return;
        }
      } catch (e: any) {
        if (e.name !== "NotAllowedError") {
          console.log("Passkey login failed", e);
        }
      }

      // Passkey cancelled or failed — show original registration error
      applyAction(result);
    }

    loading = false;
  }

  async function activateSession(prfKey: ArrayBuffer) {
    rememberPrfKey(prfKey, defaultRememberForMs);

    // Derive Nostr key from PRF key
    const [
      { entropyToMnemonic, mnemonicToSeed },
      { wordlist },
      { HDKey },
      { getPublicKey },
      { bytesToHex },
    ] = await Promise.all([
      import("@scure/bip39"),
      import("@scure/bip39/wordlists/english.js"),
      import("@scure/bip32"),
      import("nostr-tools"),
      import("@noble/hashes/utils.js"),
    ]);

    const entropy = new Uint8Array(prfKey);
    const mnemonic = entropyToMnemonic(entropy, wordlist);
    const seed = await mnemonicToSeed(mnemonic);
    const master = HDKey.fromMasterSeed(seed, versions);
    const nostrChild = master.derive("m/44'/1237'/0'/0/0");
    const sk = nostrChild.privateKey!;
    const pubkey = getPublicKey(sk);
    const skHex = bytesToHex(sk);

    // Activate session — sets auth cookies and updates pubkey server-side
    const activateData = new FormData();
    activateData.set("token", pendingToken!);
    activateData.set("username", username!);
    activateData.set("sk", skHex);
    activateData.set("pubkey", pubkey);

    const activateResponse = await fetch("/register?/activate", {
      method: "POST",
      body: activateData,
    });

    const activateResult = deserialize(await activateResponse.text());
    await invalidateAll();

    if (activateResult.type === "redirect") {
      applyAction(activateResult);
    } else {
      applyAction({ type: "redirect", status: 303, location: `/${username}` });
    }
  }

  let retryPasskey = async () => {
    loading = true;
    try {
      const prfKey = await registerPasskey(pendingToken);
      needsPasskey = false;
      await activateSession(prfKey);
    } catch (e: any) {
      fail($t("login.passkeyCreationFailed"));
    }
    loading = false;
  }

  let avatarInput: HTMLInputElement = $state() as any;
  let decr = () => (index = index <= 0 ? 63 : index - 1);
  let incr = () => (index = index >= 63 ? 0 : index + 1);
  let selectAvatar = () => avatarInput.click();

  let progress;
  let handleFile = async ({ target }: { target: HTMLInputElement }) => {
    let type = "picture";
    let file = target.files![0];
    if (!file) return;

    if (file.size > 10000000) form!.error = "File too large";
    $avatar = { file, type, progress };

    var reader = new FileReader();
    reader.onload = async (e: any) => {
      src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  let need2fa: any = $derived(form?.message === "2fa");
  let src: string = $derived(`/api/public/${punks[index]}.webp`);

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

      const result = deserialize(await response.text());

      if (result.type === "success" || result.type === "redirect") {
        try {
          const { deriveNostrEntropy } = await import("$lib/walletEntropy");
          await deriveNostrEntropy();
        } catch (e) {
          console.log("Nostr entropy derivation failed", e);
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
  <input type="file" class="hidden!" bind:this={avatarInput} onchange={(e: any) => handleFile(e)} />

  <div class="relative">
    <button
      class="absolute w-8 h-12 left-12 bg-base-100 rounded top-12"
      onclick={decr}
      aria-label="Previous"
    >
      <iconify-icon noobserver icon="ph:caret-left-bold" width="32"></iconify-icon>
    </button>
    <button class="block relative w-32 mx-auto" onclick={selectAvatar}>
      <div
        class="w-32 h-32 rounded-full border-4 border-white overflow-hidden flex mx-auto relative"
      >
        <img
          {src}
          class="w-full h-full object-cover object-center overflow-hidden"
          alt={username}
        />
      </div>
      <div class="absolute bg-base-100 rounded-full p-2 mx-auto right-0 bottom-0 z-10 w-12">
        <iconify-icon noobserver icon="ph:upload-simple-bold" width="24"></iconify-icon>
      </div>
    </button>
    <button
      class="absolute w-8 h-12 right-12 bg-base-100 rounded top-12"
      onclick={incr}
      aria-label="Next"
    >
      <iconify-icon noobserver icon="ph:caret-right-bold" width="32"></iconify-icon>
    </button>
  </div>

  {#if form?.error || form?.message}
    <div class="text-red-600 text-center" in:fly>{form?.message}{form?.error}</div>
  {/if}

  {#if needsPasskey}
    <div class="space-y-5 text-center">
      <p>{$t("login.accountCreatedNeedsPasskey")}</p>
      <button class="btn btn-accent" onclick={retryPasskey} disabled={loading}>
        {#if loading}
          <Spinner />
        {:else}
          {$t("login.setupPasskey")}
        {/if}
      </button>
    </div>
  {:else}
    <form class="space-y-5" onsubmit={handleSubmit} method="POST">
      <input
        type="hidden"
        name="loginRedirect"
        value={$loginRedirect || $page.url.searchParams.get("redirect")}
      />
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="challenge" value={challenge} />

      <label for="username" class="input flex items-center justify-center gap-2 w-full">
        <input
          class="clean"
          use:focus
          name="username"
          type="text"
          required
          bind:value={username}
          onfocus={clear}
          autocapitalize="none"
          placeholder={$t("login.username")}
        />
        <button type="button" tabindex="-1" onclick={refresh} aria-label="Randomize" class="contents">
          <iconify-icon noobserver icon="ph:dice-three-bold" width="32"></iconify-icon>
        </button>
      </label>

      <button type="submit" class="btn btn-accent" disabled={loading} bind:this={btn}>
        {#if loading}
          <Spinner />
        {:else}
          {$t("login.register")}
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
        <div class="my-auto">{$t("login.nostr")}</div>
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
    </form>
  {/if}
</div>
