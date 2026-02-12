<script lang="ts">
  import { getContext } from "svelte";
  import { tick } from "svelte";
  import { t } from "$lib/translations";
  import Pin from "$comp/Pin.svelte";
  import Qr from "$comp/Qr.svelte";
  import { copy, post, success, fail } from "$lib/utils";
  import { save, pin as current } from "$lib/store";
  import { invalidate } from "$app/navigation";
  import { page } from "$app/stores";

  let { data } = $props();
  let { user } = $derived(data);
  let { id } = $derived(user);
  let { haspin } = $derived(user);

  let confirming2fa = $state(),
    disabling2fa = $state(),
    importing = $state(),
    newNsec = $state(),
    nsec = $state(),
    otp = $state(),
    pin = $state(""),
    revealSeed,
    revealNsec = $state(),
    token = $state(""),
    setting2fa = $state(),
    settingPin = $state(),
    verify = $state("");

  let toggleImporting = () => {
    revealNsec = false;
    importing = !importing;
  };

  let toggleNsec = async () => {
    try {
      nsec = await getNsec(user);
      revealNsec = !revealNsec;
      importing = false;
    } catch (e) {
      console.log(e);
    }
  };

  let toggleSeed = async () => {
    try {
      revealSeed = !revealSeed;
    } catch (e) {
      console.log(e);
    }
  };

  let checkPin = async () => {
    try {
      if (pin.length > 5 && pin === verify) {
        $current = pin;
        pin = "";
        verify = "";
        $save.click();
        settingPin = false;
        verifying = false;
      } else {
        fail("Pin mismatch, try again");
        pin = "";
        verify = "";
        verifying = false;
        settingPin = true;
      }
    } catch (e) {
      console.log(e);
      fail("Problem setting PIN");
    }
  };

  let reset = () => {
    token = "";
    return true;
  };

  let disablingPin = $state(false);

  let togglePin = async () => {
    if (haspin) {
      try {
        disablingPin = true;
        await tick();
        $save.click();
      } catch (e) {
        console.log(e);
        fail("Failed to disable pin");
      }
    } else {
      settingPin = true;
      disablingPin = false;
    }
  };

  let startEnabling2fa = async () => {
    reset();
    try {
      if (!otp) otp = await post("/otpsecret", { pin: $current });
    } catch (e) {
      console.log(e);
    }

    setting2fa = true;
  };

  let startDisabling2fa = () => (disabling2fa = true);
  let startConfirming2fa = () => (confirming2fa = true);
  let cancel = () => {
    pin = null;
    token = null;
    verifying = false;
    settingPin = false;
    setting2fa = false;
    confirming2fa = false;
    disabling2fa = false;
  };

  let enable2fa = async (twoFa) => {
    try {
      if (setting2fa && token.length === 6) {
        await post("/enable2fa", { token });
        success("2FA enabled");
        user.twofa = 1;
        cancel();
      }
    } catch (e) {
      console.log(e);
      fail("Failed to enable 2FA, try again");
    }
  };

  let disable2fa = async () => {
    try {
      if (disabling2fa && token.length === 6) {
        await post("/disable2fa", { token });
        success("2FA disabled");
        delete user.twofa;
        disabling2fa = false;
      }
    } catch (e) {
      console.log(e);
      fail("Failed to disable 2FA, try again");
    }
  };
  let verifying = $derived(pin?.length > 5);

  $effect(() => verify && checkPin(pin));
  $effect(() => setting2fa && enable2fa(token));
  $effect(() => disabling2fa && disable2fa(token));
</script>

<input type="hidden" name="newpin" value={disablingPin ? "delete" : pin} />

<div>
  <span class="font-bold mb-1"
    >{verifying
      ? $t("user.settings.verifyPIN")
      : $t("user.settings.securityPIN")}</span
  >
  <p class="text-secondary mb-1">
    {$t("user.settings.securityPINDescription")}
  </p>
  {#if verifying}
    <Pin bind:value={verify} {cancel} notify={false} />
  {:else if settingPin}
    <Pin
      bind:value={pin}
      title={$t("user.settings.setPIN")}
      {cancel}
      notify={false}
    />
  {:else}
    <button type="button" class="btn" onclick={togglePin}>
      <iconify-icon
        noobserver
        icon={haspin ? "ph:lock-key-open-bold" : "ph:lock-key-bold"}
        width="32"
      ></iconify-icon>
      {haspin
        ? $t("user.settings.disablePIN")
        : $t("user.settings.enablePIN")}</button
    >
  {/if}
</div>

<div>
  <span class="font-bold mb-1">{$t("user.settings.twofa")}</span>
  <p class="text-secondary mb-4">
    {$t("user.settings.twofaDescription")}
  </p>

  {#if setting2fa}
    <a href={otp.uri}>
      <Qr text={otp.uri} />
    </a>

    <div class="text-center my-4">
      {$t("user.settings.accountId")}<br />
      <b>{otp.secret}</b>
    </div>

    <button type="button" class="btn" onclick={startConfirming2fa}>
      <iconify-icon noobserver icon="ph:numpad-bold" width="32"></iconify-icon>
      <div class="my-auto">Confirm</div>
    </button>
  {:else if user.twofa}
    <button type="button" class="btn" onclick={startDisabling2fa}>
      <iconify-icon noobserver icon="ph:device-mobile-bold" width="32"
      ></iconify-icon>
      <div class="my-auto">{$t("user.settings.twofaDisable")}</div>
    </button>
  {:else}
    <button type="button" class="btn" onclick={startEnabling2fa}>
      <iconify-icon noobserver icon="ph:device-mobile-bold" width="32"
      ></iconify-icon>
      <div class="my-auto">{$t("user.settings.twofaSetup")}</div>
    </button>
  {/if}

  {#if confirming2fa || disabling2fa}
    <Pin
      bind:value={token}
      title="Enter 2FA Code"
      {cancel}
      persist={false}
      notify={false}
    />
  {/if}
</div>

<div>
  <a href={`/account/new`} class="contents">
    <button class="btn btn-lg w-full rounded-2xl whitespace-nowrap">
      <iconify-icon noobserver icon="ph:plus-circle-bold" width="32"
      ></iconify-icon>
      {$t("accounts.addAccount")}
    </button>
  </a>
</div>
