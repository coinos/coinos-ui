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
    nip19,
    getEventHash,
    finalizeEvent,
    generateSecretKey,
    getPublicKey,
  } from "nostr-tools";
  import { AmberClipboardSigner } from "applesauce-signer";

  import { focus, fail, post } from "$lib/utils";
  import { password as pw, passwordPrompt } from "$lib/store";

  let { id, redirect, token, nostrSignin } = $props();
  let extension = $state();

  onMount(() => {
    if (browser && window.nostr) extension = true;
  });

  let cancel = () => (nostrSignin = false);

  let sk = $state();
  let ck = $state();
  let pk = $state();
  let relay = $state();

  let signer = $derived(
    browser &&
      navigator.userAgent.includes("Android") &&
      navigator.clipboard &&
      navigator.clipboard.readText,
  );

  let connectUrl = $state();
  // let bunkerConnect = async () => {
  //   sk = generateSecretKey();
  //   console.log("SK", bytesToHex(sk));
  //   let pubkey = getPublicKey(sk);
  //   console.log("PUBKEY", pubkey);
  //
  //   const url = new URL(bunker);
  //   const secret = url.searchParams.get("secret");
  //   console.log("URL", url);
  //   pk = url.host || url.pathname.replace("//", "");
  //   console.log("PK", pk);
  //   const relayUrl = url.searchParams.get("relay");
  //   relay = await Relay.connect(relayUrl);
  //   console.log("connecting to", relayUrl);
  //
  //   ck = getConversationKey(sk, pk);
  //
  //   console.log("PK", pk);
  //   console.log("CK", bytesToHex(ck));
  //
  //   let connect = {
  //     id: crypto.randomUUID(),
  //     method: "connect",
  //     params: [pk, secret, "get_public_key,sign_event"],
  //   };
  //
  //   let event = {
  //     created_at: Math.round(Date.now() / 1000),
  //     kind: 24133,
  //     pubkey,
  //     content: encrypt(JSON.stringify(connect), ck),
  //     tags: [["p", pk]],
  //   };
  //
  //   let signedEvent = finalizeEvent(event, sk);
  //   console.log("publishing connection event", signedEvent);
  //   await relay.publish(signedEvent);
  //
  //   const sub = relay.subscribe([{ kinds: [24133], "#p": [pubkey] }], {
  //     async onevent(ev) {
  //       console.log("got event:", ev);
  //       try {
  //         console.log(decrypt(ev.content, ck));
  //       } catch (e) {
  //         console.log(e);
  //       }
  //     },
  //   });
  // };

  let getPubkey = async () => {
    let pubkey = getPublicKey(sk);
    let getPubkey = {
      id: crypto.randomUUID(),
      method: "get_public_key",
      params: [],
    };

    let testEvent = {
      created_at: Math.round(Date.now() / 1000),
      kind: 1,
      content: "hi mom",
      tags: [],
    };

    let signEvent = {
      id: crypto.randomUUID(),
      method: "sign_event",
      params: [JSON.stringify(testEvent)],
    };

    let event = {
      created_at: Math.round(Date.now() / 1000),
      kind: 24133,
      pubkey,
      content: encrypt(JSON.stringify(signEvent), ck),
      tags: [["p", pk]],
    };

    let signedEvent = finalizeEvent(event, sk);
    await relay.publish(signedEvent);
  };

  let nostrConnect = async () => {
    let secret = crypto.randomUUID();
    let sk = generateSecretKey();
    console.log("SK", bytesToHex(sk));
    let pubkey = getPublicKey(sk);
    console.log("PUBKEY", pubkey);
    connectUrl = `nostrconnect://${pubkey}?relay=wss%3A%2F%2Frelay.coinos.io&perms=nip44_encrypt%2Cnip44_decrypt%2Csign_event%3A13%2Csign_event%3A14%2Csign_event%3A1059&name=Coinos&secret=${secret}`;

    const relay = await Relay.connect("wss://relay.coinos.io");
    console.log(`connected to ${relay.url}`);
    let finished, remoteSignerPubkey;
    const sub = relay.subscribe([{ kinds: [24133], "#p": [pubkey] }], {
      async onevent(event) {
        console.log("got event:", event);
        remoteSignerPubkey = event.pubkey;
        // console.log("decrypted", decrypt(event.content, sk));
        if (!finished) {
          finished = true;
          let event = {
            created_at: Math.round(Date.now() / 1000),
            kind: 24133,
            pubkey,
            content: encrypt(
              JSON.stringify({
                id: "1234",
                method: "get_public_key",
                params: [],
              }),
              sk,
              hexToBytes(remoteSignerPubkey),
            ),
            tags: [["p", remoteSignerPubkey]],
          };

          console.log("asking for public key", event);
          console.log("DECRYPTED", decrypt(event.content, sk));
          let signedEvent = finalizeEvent(event, sk);
          console.log("sleeping");
          await new Promise((r) => setTimeout(r, 5000));
          console.log("sending");
          await relay.publish(signedEvent);
        }
      },
    });
    console.log("subbed");
  };

  let pubkey = $state();
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
  //
  // let signerSign = async () => {
  //   const signer = new AmberClipboardSigner();
  //   ev.sig = await signer.signEvent(ev);
  //   nostrLogin(await signer.signEvent(ev));
  // };
  //
  let signerSign = async () => {
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

    console.log("SIGNED", signedEvent);

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

      <!-- <div class="break-all"> -->
      <!--   {JSON.stringify(ev)} -->
      <!-- </div> -->
      {#if pubkey}
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
        <!-- {#if connectUrl} -->
        <!--   <a href={connectUrl}> -->
        <!--     connect -->
        <!--     <img -->
        <!--       src={`/qr/${encodeURIComponent(connectUrl)}/raw`} -->
        <!--       class="z-10 border-4 border-white" -->
        <!--       alt="QR" -->
        <!--     /> -->
        <!--     <div class="break-all"> -->
        <!--       {connectUrl} -->
        <!--     </div> -->
        <!--   </a> -->
        <!--   <button class="btn" onclick={() => copy(connectUrl)}>Copy</button> -->
        <!-- {:else} -->
        <!--   <button type="button" class="btn" onclick={nostrConnect}> -->
        <!--     <img src="/images/nostr.png" class="w-8" /> -->
        <!--     <div class="my-auto">NIP-46 Connect</div> -->
        <!--   </button> -->
        <!-- {/if} -->
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

        {#if showNsec}
          <input bind:value={nsec} placeholder="nsec..." />
          <button type="button" class="btn" onclick={nsecSign}>
            <iconify-icon icon="ph:key-bold" width="32"></iconify-icon>
            <div class="my-auto">Nsec login</div>
          </button>
        {:else}
          <button type="button" class="btn" onclick={toggleNsec}>
            <iconify-icon icon="ph:key-bold" width="32"></iconify-icon>
            <div class="my-auto">Nsec login</div>
          </button>
        {/if}
      {/if}
    </div>
  </div>
{/if}
