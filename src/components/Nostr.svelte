<script lang="ts">
  import { applyAction, deserialize } from "$app/forms";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { t } from "$lib/translations";
  import PasswordInput from "$comp/PasswordInput.svelte";
  import { Relay } from "nostr-tools/relay";
  import { encrypt, decrypt, getConversationKey } from "nostr-tools/nip44";
  import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
  import {
    nip04,
    nip19,
    getEventHash,
    finalizeEvent,
    generateSecretKey,
    getPublicKey,
  } from "nostr-tools";
  import { AmberClipboardSigner } from "applesauce-signer";

  import { copy, focus, fail, post } from "$lib/utils";
  import { password as pw, passwordPrompt } from "$lib/store";
  // import { PUBLIC_COINOS_RELAY as relayUrl } from "$env/static/public";
  const relayUrl = "wss://relay.nsec.app";

  let { id, redirect, token, nostrSignin = $bindable() } = $props();
  let extension = $state();

  onMount(() => {
    if (browser && window.nostr) extension = true;
  });

  let cancel = () => {
    nostrSignin = false;
    showNsec = false;
    pubkey = undefined;
    connectUrl = undefined;
  };

  let sk = $state();
  let ck = $state();
  let pk = $state();
  let pubkey = $state();

  let signer = $derived(
    browser &&
      navigator.userAgent.includes("Android") &&
      navigator.clipboard &&
      navigator.clipboard.readText,
  );

  let connectUrl = $state();
  let nostrConnect = async () => {
    let secret = crypto.randomUUID();

    sk = generateSecretKey();
    pubkey = getPublicKey(sk);

    connectUrl = `nostrconnect://${pubkey}?relay=${encodeURIComponent(relayUrl)}&perms=sign_event%3A1&name=Coinos&secret=${secret}`;

    let relay = await Relay.connect(relayUrl);

    let signatureRequested;
    const sub = relay.subscribe([{ kinds: [24133], "#p": [pubkey] }], {
      async onevent(event) {
        pk = event.pubkey;
        ck = getConversationKey(sk, pk);
        let decrypted;
        console.log("EVENT", event);
        try {
          decrypted = JSON.parse(decrypt(event.content, ck));
        } catch (e) {
          try {
            decrypted = JSON.parse(await nip04.decrypt(sk, pk, event.content));
          } catch (e) {
            console.log("ERROR", e);
          }
        }

        if (decrypted?.result?.includes("sig")) {
          await nostrLogin(JSON.parse(decrypted.result));
        } else if (!signatureRequested) {
          signatureRequested = true;
          let signEvent = {
            id: crypto.randomUUID(),
            method: "sign_event",
            params: [JSON.stringify({ ...ev, pubkey })],
          };

          // let content = encrypt(JSON.stringify(signEvent), ck);
          let content = await nip04.encrypt(sk, pk, JSON.stringify(signEvent));
          console.log("CONTENT", content);
          let signedSignEvent = finalizeEvent(
            {
              created_at: Math.round(Date.now() / 1000),
              kind: 24133,
              pubkey,
              content,
              tags: [["p", pk]],
            },
            sk,
          );

          await new Promise((r) => setTimeout(r, 1000));
          console.log("PUBLISHING", signedSignEvent);
          relay.publish(signedSignEvent);
        }
      },
    });
  };

  let ev = $derived({
    kind: 1,
    created_at: Date.now(),
    content: id,
    tags: [],
  });

  let nsec = $state();
  let showNsec = $state();
  let toggleNsec = () => (showNsec = !showNsec);
  let nsecSign = async () => {
    let sk;
    if (nsec.startsWith("nsec")) sk = nip19.decode(nsec).data as Uint8Array;
    else sk = hexToBytes(nsec);

    nostrLogin(finalizeEvent(ev, sk));
  };

  let extensionSign = async () => {
    nostrLogin(await window.nostr.signEvent(ev));
  };

  let signerGetPubkey = async () => {
    const signer = new AmberClipboardSigner();
    pubkey = await signer.getPublicKey();
    ev.pubkey = pubkey;
    console.log("PUBKEY", ev.pubkey);
  };
  let signerSigning;
  let signerSign = async () => {
    signerSigning = true;
    document.addEventListener("focus", signerSigned, true);
  };

  const signerSigned = async () => {
    document.removeEventListener("focus", signerSigned, true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    ev.sig = await navigator.clipboard.readText();
    ev.id = getEventHash(ev);
    nostrLogin(ev);
  };

  let nostrLogin = async (signedEvent) => {
    // let pubkey = await window.nostr.getPublicKey();
    const formData = new FormData();

    try {
      formData.append("loginRedirect", redirect);
      formData.append("token", token);
      formData.append("event", JSON.stringify(signedEvent));
      formData.append("id", id);

      let response = await fetch("/login?/nostr", {
        method: "POST",
        body: formData,
      });

      const result = deserialize(await response.text());

      if (result.type === "success") {
        await invalidateAll();
      }

      applyAction(result);
    } catch (e) {
      fail(e.message);
    }
  };
</script>

hi
{nostrSignin}
{#if nostrSignin}
  <div
    class="fixed inset-0 bg-base-100 bg-opacity-90 overflow-y-auto h-full w-full z-50"
  >
    <div
      class="relative mx-auto mt-10 p-5 border w-96 shadow-lg rounded-md bg-base-100 space-y-5"
    >
      <h1 class="text-center text-2xl font-semibold">
        {$t("login.nostr")}
      </h1>

      {#if showNsec}
        <input bind:value={nsec} placeholder="nsec..." />
        <button type="button" class="btn" onclick={nsecSign}>
          <iconify-icon icon="ph:key-bold" width="32"></iconify-icon>
          <div class="my-auto">Login</div>
        </button>
      {:else if connectUrl}
        <a href={connectUrl}>
          <img
            src={`/qr/${encodeURIComponent(connectUrl)}/raw`}
            class="z-10 border-4 border-white"
            alt="QR"
          />
          <div class="break-all">
            {connectUrl}
          </div>
        </a>
        <button class="btn" onclick={() => copy(connectUrl)}>Copy</button>
      {:else if signerSigning && pubkey}
        <a
          href={`nostrsigner:${encodeURIComponent(JSON.stringify(ev))}?compressionType=none&returnType=signature&type=sign_event&appName=Coinos`}
          type="button"
          class="btn"
          onclick={signerSign}
        >
          <iconify-icon
            icon="material-symbols:diamond-rounded"
            width="32"
            class="text-orange-400"
          ></iconify-icon>
          <div class="my-auto">NIP-55 Signer Step 2</div>
        </a>
      {:else}
        {#if extension}
          <button type="button" class="btn" onclick={extensionSign}>
            <iconify-icon
              icon="lucide-lab:bee"
              width="32"
              class="text-yellow-400"
            ></iconify-icon>
            <div class="my-auto">NIP-10 Extension</div>
          </button>
        {/if}
        <button type="button" class="btn" onclick={nostrConnect}>
          <img src="/images/nostr.png" class="w-8" />
          <div class="my-auto">NIP-46 Connect</div>
        </button>
        {#if signer}
          <a type="button" class="btn" onclick={signerGetPubkey}>
            <iconify-icon
              icon="material-symbols:diamond-rounded"
              width="32"
              class="text-orange-400"
            ></iconify-icon>
            <div class="my-auto">NIP-55 Signer</div>
          </a>
        {/if}

        <button type="button" class="btn" onclick={toggleNsec}>
          <iconify-icon icon="ph:key-bold" width="32"></iconify-icon>
          <div class="my-auto">Nsec Login</div>
        </button>
      {/if}

      <button type="button" class="btn" onclick={cancel}>
        <iconify-icon icon="ph:x-bold" width="32"></iconify-icon>
        <div class="my-auto">Cancel</div>
      </button>
    </div>
  </div>
{/if}
