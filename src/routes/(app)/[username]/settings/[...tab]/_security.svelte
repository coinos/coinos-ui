<script>
  import { getMnemonic, getNsec } from "$lib/nostr";
  import { tick } from "svelte";
  import { t } from "$lib/translations";
  import Pin from "$comp/Pin.svelte";
  import Icon from "$comp/Icon.svelte";
  import Qr from "$comp/Qr.svelte";
  import { copy, post, success, fail } from "$lib/utils";
  import { pin as current } from "$lib/store";
  import { invalidate } from "$app/navigation";
  import { page } from "$app/stores";

  export let user, rates, submit;

  let confirming2fa,
    disabling2fa,
    locked,
    mnemonic,
    nsec,
    old,
    otp,
    password,
    pin,
    revealPassword,
    revealSeed,
    revealNsec,
    token = "",
    setting2fa,
    settingPin,
    verify;

  let toggleNsec = async () => {
    try {
      nsec = await getNsec(user);
      revealNsec = !revealNsec;
    } catch (e) {
      console.log(e);
    }
  };

  let togglePassword = () => (revealPassword = !revealPassword);
  let toggleSeed = async () => {
    try {
      mnemonic = await getMnemonic(user);
      revealSeed = !revealSeed;
    } catch (e) {
      console.log(e);
    }
  };

  $: verifying = pin?.length > 5;
  $: verify && checkPin(pin);
  let checkPin = async () => {
    old = $current;

    try {
      if (pin.length > 5 && pin === verify) {
        user.haspin = true;
        $current = pin;
        pin = "";
        verify = "";
        submit.click();
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

  let disablingPin = false;

  let togglePin = async () => {
    if (user.haspin) {
      try {
        disablingPin = true;
        await tick();
        submit.click();
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

  $: enable2fa(token);
  let enable2fa = async (twoFa) => {
    try {
      if (setting2fa && token.length === 6) {
        await post("/enable2fa", { token });
        success("2FA enabled");
        user.twofa = 1;
        cancel();
      }
    } catch (e) {
      fail("Failed to enable 2FA, try again");
    }
  };

  $: disable2fa(token);
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
</script>

<input type="hidden" name="newpin" value={disablingPin ? "delete" : pin} />
<input type="hidden" name="confirm" bind:value={password} />

<div class="relative mb-5">
  <label for="password" class="block font-bold mb-3 "
    >{$t("user.settings.newPassword")}</label
  >
  {#if revealPassword}
    <input name="password" type="text" bind:value={password} class="dark:bg-stone-800 dark:border-0" />
  {:else}
    <input name="password" type="password" bind:value={password} class="dark:bg-stone-800 dark:border-0" />
  {/if}
  <button
    type="button"
    on:click={togglePassword}
    on:keydown={togglePassword}
    class="absolute right-5 dark:invert-[95%] {revealPassword ? 'top-[54px]' : 'top-[52px]'} "
  >
    <Icon icon={revealPassword ? "eye" : "eye-off"} />
  </button>
</div>

<div>
  <span class="font-bold mb-1"
    >{verifying
      ? $t("user.settings.verifyPIN")
      : $t("user.settings.securityPIN")}</span
  >
  <p class="text-secondary dark:text-gray-200 mb-4">
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
    <button type="button" class="py-2 px-4 font-bold rounded-full mx-auto border-[1px] flex border-gray-200 dark:border-gray-50" on:click={togglePin}
      ><Icon icon="lock" style="mr-1 dark:invert" />
      {user.haspin
        ? $t("user.settings.disablePIN")
        : $t("user.settings.enablePIN")}</button
    >
  {/if}
</div>

{#if user.haspin}
  <div>
    <label for="locktime" class="font-bold mb-1"
      >{$t("user.settings.autoLock")}</label
    >
    <p class="text-secondary dark:text-gray-200 mb-1">
      {$t("user.settings.autoLockDescription")}
    </p>
    <select
      name="locktime"
      class="select-styles block py-3 w-full"
      value={parseInt(user.locktime)}
    >
      <option value={5 * 60}>5 {$t("user.settings.minutes")}</option>
      <option value={10 * 60}>10 {$t("user.settings.minutes")}</option>
      <option value={30 * 60}>30 {$t("user.settings.minutes")}</option>
      <option value={60 * 60}>1 {$t("user.settings.hour")}</option>
      <option value={8 * 60 * 60}>8 {$t("user.settings.hours")}</option>
    </select>
  </div>
{/if}

<div>
  <span class="font-bold mb-4">{$t("user.settings.twofa")}</span>
  <p class="text-secondary dark:text-gray-200 mb-4">
    {$t("user.settings.twofaDescription")}
  </p>

  {#if setting2fa}
    <a href={otp.uri}>
      <Qr src={otp.qr} />
    </a>

    <div class="text-center my-4">
      {$t("user.settings.accountId")}<br />
      <b>{otp.secret}</b>
    </div>

    <button type="button" class="py-2 px-4 font-bold rounded-full mx-auto border-[1px] flex border-gray-200 dark:border-gray-50" on:click={startConfirming2fa}>
      <Icon icon="mobile" style="mr-1 dark:invert" />
      Confirm
    </button>
  {:else if user.twofa}
    <button type="button" class="py-2 px-4 font-bold rounded-full mx-auto border-[1px] flex border-gray-200 dark:border-gray-50" on:click={startDisabling2fa}>
      <Icon icon="mobile" style="mr-1 dark:invert" />
      {$t("user.settings.twofaDisable")}
    </button>
  {:else}
    <button type="button" class="py-2 px-4 font-bold rounded-full mx-auto border-[1px] flex border-gray-200 dark:border-gray-50" on:click={startEnabling2fa}>
      <Icon icon="mobile" style="mr-1 dark:invert" />
      {$t("user.settings.twofaSetup")}
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
  <label for="seedphrase" class="font-bold"
    >{$t("user.settings.seedPhrase")}</label
  >

  <p class="text-secondary dark:text-gray-200 mb-4">
    {$t("user.settings.seedDescription")}
  </p>

  <button type="button" class="py-2 px-4 font-bold rounded-full mx-auto border-[1px] flex border-gray-200 dark:border-gray-50" on:click={toggleSeed}>
    <Icon icon="warning" style="mr-2 w-6 my-auto dark:invert" />
    {revealSeed ? $t("user.settings.hideSeed") : $t("user.settings.revealSeed")}
  </button>

  {#if revealSeed}
    <div class="text-lg my-6">
      {mnemonic}
    </div>

    <button type="button" class="py-2 px-4 font-bold rounded-full mx-auto border-[1px] flex border-gray-200 dark:border-gray-50" on:click={() => copy(mnemonic)}>
      <Icon icon="copy" style="mr-1 w-6 my-auto dark:invert" />
      Copy
    </button>
  {/if}
</div>

<div>
  <label for="seedphrase" class="font-bold"
    >{$t("user.settings.nostrKeys")}</label
  >

  <p class="text-secondary dark:text-gray-200 mb-4">
    {$t("user.settings.nostrDescription")}
  </p>

  <button type="button" class="py-2 px-4 font-bold rounded-full mx-auto border-[1px] flex border-gray-200 dark:border-gray-50" on:click={toggleNsec}>
    <Icon icon="warning" style="mr-2 w-6 my-auto dark:invert" />
    {revealNsec ? $t("user.settings.hideNsec") : $t("user.settings.revealNsec")}
  </button>

  {#if revealNsec}
    <div class="text-lg break-all my-6">
      {nsec}
    </div>

    <button type="button" class="py-2 px-4 font-bold rounded-full mx-auto border-[1px] flex border-gray-200 dark:border-gray-50" on:click={() => copy(nsec)}>
      <Icon icon="copy" style="mr-1 w-6 my-auto dark:invert" />
      Copy
    </button>
  {/if}
</div>
