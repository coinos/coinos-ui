<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { t } from "$lib/translations";
  import PasswordInput from "$comp/PasswordInput.svelte";
  import { Relay } from "nostr-tools/relay";
  import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
  import {
    nip04,
    nip19,
    getEventHash,
    generateSecretKey,
    getPublicKey,
  } from "nostr-tools";
  import { getConversationKey, decrypt } from "nostr-tools/nip44";

  import { copy, focus, fail, post } from "$lib/utils";
  import { eventToSign, signer } from "$lib/store";
  import { nostrConnectRelay } from "$lib/nostr";
  import Success from "$comp/Success.svelte";

  let { id } = $props();
  let extensionAvailable = $derived(browser && window.nostr);

  let cancel = () => {
    eventToSign.set();
    showNsec = false;
    connectUrl = undefined;
    $signer = "cancel";
  };

  let signerAvailable = $derived(
    browser &&
      navigator.userAgent.includes("Android") &&
      navigator.clipboard &&
      navigator.clipboard.readText,
  );

  let hadSigner = $state(!!$signer);

  let connectUrl = $state();
  let nostrConnect = async () => {
    let connectionSecret = crypto.randomUUID();

    let sk = generateSecretKey();
    let pubkey = getPublicKey(sk);

    connectUrl = `nostrconnect://${pubkey}?relay=${encodeURIComponent(nostrConnectRelay)}&perms=sign_event%3A1&name=Coinos&secret=${connectionSecret}`;

    let relay = await Relay.connect(nostrConnectRelay);
    relay.subscribe([{ kinds: [24133], "#p": [pubkey] }], {
      async onevent(event) {
        let pk = event.pubkey;
        try {
          let result;
          try {
            ({ result } = JSON.parse(
              await nip04.decrypt(sk, pk, event.content),
            ));
          } catch (e) {
            let ck = await getConversationKey(sk, pk);
            ({ result } = JSON.parse(await decrypt(event.content, ck)));
          }

          if (result === connectionSecret || result === "ack") {
            $signer = {
              method: "connect",
              params: {
                sk: bytesToHex(sk),
                pk,
                pubkey,
              },
              ready: true,
            };
          }
        } catch (e) {
          console.log("failed to parse nostr connect event", e);
        }
      },
    });
  };

  let nsec = $state();
  let showNsec = $state();
  let toggleNsec = () => {
    $signer = {
      method: "nsec",
    };
  };

  let nsecSign = async () => {
    let sk;
    if (nsec.startsWith("nsec")) sk = nip19.decode(nsec).data as Uint8Array;
    else sk = hexToBytes(nsec);

    $signer = {
      method: "nsec",
      params: { sk: bytesToHex(sk), pk: getPublicKey(sk) },
      ready: true,
    };
  };

  let extensionSign = async () => {
    $signer = { method: "extension", ready: true };
  };

  let signerSign = async () => {
    document.addEventListener("focus", signerSigned, true);
  };

  const signerSigned = async () => {
    await new Promise((r) => setTimeout(r, 100));
    let sig = await navigator.clipboard.readText();
    $signer.params.sig = sig;
    $signer.ready = true;
    $signer = $signer;
  };

  let signUrl = $derived(
    `nostrsigner:${encodeURIComponent(JSON.stringify($eventToSign))}?compressionType=none&returnType=signature&type=sign_event&appName=Coinos`,
  );
</script>

{#if $eventToSign && !$signer?.ready}
  <div
    class="fixed inset-0 bg-base-100 bg-opacity-90 overflow-y-auto h-full w-full z-50"
  >
    <div
      class="relative mx-auto mt-10 p-5 border w-96 shadow-lg rounded-md bg-base-100 space-y-5"
    >
      <h1 class="text-center text-2xl font-semibold">Nostr sign</h1>

      {#if $eventToSign.sig && !hadSigner}
        <Success />
      {:else}
        {#if connectUrl}
          <div class="space-y-2">
            <a href={connectUrl} class="block space-y-2">
              <img
                src={`/qr/${encodeURIComponent(connectUrl)}/raw`}
                class="z-10 border-4 border-white"
                alt="QR"
              />
              <div class="break-all">
                {connectUrl}
              </div>
            </a>
            <a href={connectUrl} class="btn">
              <iconify-icon
                noobserver
                icon="ph:arrow-square-out-bold"
                width="32"
              ></iconify-icon>
              {$t("payments.openLink")}</a
            >
            <button class="btn" onclick={() => copy(connectUrl)}>
              <iconify-icon noobserver icon="ph:copy-bold" width="32"
              ></iconify-icon>
              {$t("payments.copy")}</button
            >
          </div>
        {:else}
          {#if $signer?.method === "nsec"}
            <input bind:value={nsec} placeholder="nsec..." />
            <button type="button" class="btn btn-accent" onclick={nsecSign}>
              <iconify-icon icon="ph:paper-plane-right-bold" width="32"
              ></iconify-icon>
              <div class="my-auto">Submit</div>
            </button>
          {/if}

          {#if !$signer}
            {#if extensionAvailable}
              <button type="button" class="btn" onclick={extensionSign}>
                <iconify-icon
                  icon="lucide-lab:bee"
                  width="32"
                  class="text-yellow-400"
                ></iconify-icon>
                <div class="my-auto">Browser extension</div>
              </button>
            {/if}

            <button type="button" class="btn" onclick={nostrConnect}>
              <img src="/images/nostr.png" class="w-8" alt="Nostr" />
              <div class="my-auto">Nostr connect</div>
            </button>

            <button type="button" class="btn" onclick={toggleNsec}>
              <iconify-icon icon="ph:key-bold" width="32"></iconify-icon>
              <div class="my-auto">Secret key</div>
            </button>
          {/if}
        {/if}

        <button type="button" class="btn" onclick={cancel}>
          <iconify-icon icon="ph:x-bold" width="32"></iconify-icon>
          <div class="my-auto">Cancel</div>
        </button>
      {/if}
    </div>
  </div>
{/if}
