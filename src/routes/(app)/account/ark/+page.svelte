<script lang="ts">
  import { preventDefault } from "svelte/legacy";
  import { tick, onMount } from "svelte";
  import { t } from "$lib/translations";
  import Spinner from "$comp/Spinner.svelte";
  import { bytesToHex, randomBytes } from "@noble/hashes/utils";
  import { hex } from "@scure/base";
  import { focus, fail, post, copy } from "$lib/utils";
  import { goto } from "$app/navigation";
  import { arkServerUrl } from "$lib/ark";

  let { data } = $props();
  let { user } = data;

  let privateKey = $state("");
  let arkAddress = $state("");
  let nsec = $state("");
  let showNsec = $state(false);
  let confirmed = $state(false);
  let submitting = $state(false);

  let password = $state("");
  let confirm = $state("");
  let revealPassword = $state(false);
  let revealConfirm = $state(false);

  let name = "Ark Vault";
  let type = "ark";

  onMount(() => {
    generateKey();
  });

  let generateKey = async () => {
    const { nip19 } = await import("nostr-tools");
    const { SingleKey, Wallet } = await import("@arkade-os/sdk");
    privateKey = bytesToHex(randomBytes(32));
    nsec = nip19.nsecEncode(hex.decode(privateKey));
    showNsec = false;
    confirmed = false;

    // Derive the ARK address from the private key
    const identity = SingleKey.fromHex(privateKey);
    const wallet = await Wallet.create({ identity, arkServerUrl });
    arkAddress = await wallet.getAddress();
  };

  let revealNsec = () => {
    showNsec = true;
  };

  let confirmBackup = () => {
    confirmed = true;
  };

  let submit = async () => {
    if (!confirmed) {
      fail("Please backup your key first");
      return;
    }

    if (!password || password !== confirm) {
      fail($t("accounts.passwordMismatch"));
      return;
    }

    submitting = true;
    await tick();

    try {
      // Encrypt the private key using NIP-49
      const { encrypt } = await import("nostr-tools/nip49");
      let seed = await encrypt(hex.decode(privateKey), password);

      await post("/account", { name, seed, type, arkAddress });
      goto(`/${user.username}`);
    } catch (e) {
      console.log(e);
      fail(e.message);
    }

    submitting = false;
  };
</script>

<div class="space-y-5">
  <div class="flex items-center justify-center gap-2">
    <h1 class="text-3xl font-semibold">Create Ark Wallet</h1>
  </div>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
    {#if !confirmed}
      <div class="space-y-4">
        <p class="text-secondary">
          Your Ark wallet is secured by a private key. Please copy it down somewhere safe.
        </p>

        {#if showNsec}
          <div class="space-y-2">
            <button
              type="button"
              class="break-all p-4 rounded-lg cursor-pointer border text-left w-full"
              onclick={() => copy(nsec)}
              aria-label="Copy backup key"
            >
              {nsec}
            </button>
          </div>

          <div class="flex gap-2">
            <button type="button" class="btn btn-accent flex-grow" onclick={confirmBackup}>
              <iconify-icon noobserver icon="ph:check-bold" width="24"></iconify-icon>
              I've backed it up
            </button>
          </div>
        {:else}
          <button type="button" class="btn btn-warning w-full" onclick={revealNsec}>
            <iconify-icon noobserver icon="ph:eye-bold" width="24"></iconify-icon>
            Reveal backup key
          </button>
        {/if}
      </div>
    {:else}
      <form onsubmit={preventDefault(submit)} class="space-y-5">
        <p class="text-secondary">
          Set a password to encrypt your key. You'll need this password to send funds.
        </p>

        <label
          for="password"
          class="input flex items-center justify-center gap-2 w-full"
        >
          {#if revealPassword}
            <input
              name="password"
              type="text"
              required
              bind:value={password}
              autocapitalize="none"
              class="clean"
              placeholder="Password"
            />
          {:else}
            <input
              use:focus
              name="password"
              type="password"
              placeholder="Password"
              required
              bind:value={password}
              autocapitalize="none"
              class="clean"
            />
          {/if}

          <button
            type="button"
            class="ml-auto"
            aria-label="Toggle password visibility"
            onclick={() => (revealPassword = !revealPassword)}
          >
            <iconify-icon
              noobserver
              icon={revealPassword ? "ph:eye-bold" : "ph:eye-slash-bold"}
              width="32"
            ></iconify-icon>
          </button>
        </label>

        <label
          for="confirm"
          class="input flex items-center justify-center gap-2 w-full"
        >
          {#if revealConfirm}
            <input
              name="confirm"
              type="text"
              placeholder="Confirm password"
              required
              bind:value={confirm}
              autocapitalize="none"
              class="clean"
            />
          {:else}
            <input
              type="password"
              placeholder="Confirm password"
              required
              bind:value={confirm}
              autocapitalize="none"
              class="clean"
            />
          {/if}
          <button
            type="button"
            class="ml-auto"
            aria-label="Toggle confirmation visibility"
            onclick={() => (revealConfirm = !revealConfirm)}
          >
            <iconify-icon
              noobserver
              icon={revealConfirm ? "ph:eye-bold" : "ph:eye-slash-bold"}
              width="32"
            ></iconify-icon>
          </button>
        </label>

        <div class="flex gap-2">
          <button
            type="button"
            class="btn !w-auto grow"
            onclick={() => (confirmed = false)}
          >
            Back
          </button>
          <button
            disabled={submitting}
            type="submit"
            class="btn btn-accent !w-auto grow"
          >
            {#if submitting}
              <Spinner />
            {:else}
              Create Wallet
            {/if}
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>
