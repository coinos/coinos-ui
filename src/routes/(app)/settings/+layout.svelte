<script>
  import { browser } from "$app/environment";
  import { onMount, tick } from "svelte";
  import { fly } from "svelte/transition";
  import { applyAction, deserialize } from "$app/forms";

  import Icon from "$comp/Icon.svelte";
  import Spinner from "$comp/Spinner.svelte";
  import Pin from "$comp/Pin.svelte";
  import { loading, t } from "$lib/translations";
  import { fd, fail, auth, post, sleep, warning, success } from "$lib/utils";
  import { avatar, banner, signer, password, pin, save } from "$lib/store";
  import { upload } from "$lib/upload";
  import { page } from "$app/stores";
  import { sign, send, getPrivateKey } from "$lib/nostr";
  import { invalidateAll } from "$app/navigation";
  import { getPublicKey } from "nostr-tools";
  import { bytesToHex } from "@noble/hashes/utils";

  import { SimplePool } from 'nostr-tools/pool';
  import { finalizeEvent } from 'nostr-tools/pure';

  let { children, data, form } = $props();

  let formElement = $state();

  let { token, cookies, subscriptions } = $derived(data);
  let { tab } = $derived(data);
  let user = $derived({ ...data?.user, ...form?.user });
  let prev = $derived({ ...data.user });

  let justUpdated;
  let throttledSuccess = () => {
    if (!justUpdated) {
      justUpdated = true;
      success($t("user.settings.saved"), false);
      setTimeout(() => (justUpdated = false), 5000);
    }
  };

  let tabs = [
    { name: "profile", key: "ACCOUNT" },
    { name: "account", key: "POINT_OF_SALE" },
    { name: "nostr", key: "NOSTR" },
    { name: "security", key: "SECURITY" },
  ];

  let { about, id, username } = $derived(user);
  let submitting = $state();

  const pool = new SimplePool();
  import { PUBLIC_DM_RELAYS } from '$env/static/public';
  const DM_RELAYS_LIST = PUBLIC_DM_RELAYS.split(',');
  let updateRelaysIfAvailable = async () => {
    const relayEntry = document.getElementById('dmRelays');
    if (!relayEntry) return;

    const newRelays = relayEntry.value.split('\n');
    const event = {
      kind: 10050,
      created_at: Math.floor(Date.now() / 1000),
      tags: newRelays.map(r => ["relay", r]),
      content: ""
    };
    let signed;
    if (await window.nostr.getPublicKey() === user.pubkey) {
      signed = await window.nostr.signEvent(event);
    } else {
      const sk = await getPrivateKey(user);
      signed = finalizeEvent(event, sk);
    }
    await Promise.any(pool.publish(DM_RELAYS_LIST, signed));
  }

  async function handleSubmit(e) {
    updateRelaysIfAvailable();
    e.preventDefault();
    try {
      submitting = true;
      let body = new FormData(formElement);
      form = {
        user: await fd({
          formData() {
            return body;
          },
        }),
      };

      await tick();

      if (!user.pubkey || user.pubkey === prev.pubkey) {
        body.delete("pubkey");
      } else {
        $signer = null;

        let event = {
          kind: 27235,
          created_at: Date.now(),
          content: "",
          tags: [
            ["u", `${$page.url.origin}/api/nostrAuth`],
            ["method", "POST"],
            ["challenge", user.challenge],
          ],
        };

        let signedEvent = await sign(event);
        body.set("event", JSON.stringify(signedEvent));
      }

      if ($avatar) {
        try {
          let { hash } = JSON.parse(
            await upload($avatar.file, $avatar.type, $avatar.progress, token),
          );

          let url = `${$page.url.origin}/api/public/${hash}.webp`;
          body.set("picture", url);

          await fetch(url, { cache: "reload", mode: "no-cors" });
        } catch (e) {
          console.log("problem upsubmitting avatar", e);
        }
      }

      if ($banner) {
        try {
          let { hash } = JSON.parse(
            await upload($banner.file, $banner.type, $banner.progress, token),
          );

          let url = `${$page.url.origin}/api/public/${hash}.webp`;
          body.set("banner", url);
          await fetch(url, { cache: "reload", mode: "no-cors" });
        } catch (e) {
          console.log("problem uploading banner", e);
        }
      }

      if (
        ["username", "about", "picture", "display", "banner"].some(
          (a) => user[a] && user[a] !== prev[a],
        )
      ) {
        let event = {
          pubkey: user.pubkey,
          created_at: Math.floor(Date.now() / 1000),
          kind: 0,
          content: JSON.stringify({
            name: user.username,
            about: user.about,
            picture: user.picture,
            banner: user.banner,
            displayName: user.display,
            lud16: `${user.username}@${$page.url.hostname}`,
          }),
          tags: [],
        };

        try {
          event = await sign(event, user);
          send(event);
        } catch (e) {
          console.log(e);
          warning("Nostr profile could not be updated");
        }
      }

      let email = body.get("email");
      if (email && email !== prev.email) {
        try {
          cookies.get = function (n) {
            return this.find((c) => c.name === n).value;
          };

          user.verified = false;

          await post("/email", { email });

          warning($t("user.settings.verifying"), false);
        } catch (e) {
          fail(e.message);
          console.log(e);
        }
      }

      const response = await fetch(formElement.action, {
        method: "POST",
        body,
      });

      const result = deserialize(await response.text());

      if (result.type === "success") {
        await invalidateAll();
        if (body.get("password")) $password = body.get("password");
      }

      applyAction(result);
    } catch (e) {
      console.log(e);
      fail("Something went wrong");
    }

    submitting = false;
  }
  $effect(() => form?.success && throttledSuccess());
  $effect(() => form?.message && fail(form.message));
  $effect(() => {
    if (form?.message?.startsWith("Pin")) {
      fail("Wrong pin, try again");
      $pin = "";
    }
  });
  $effect(() => {
    if (!$loading && $page.url.searchParams.get("verified"))
      success($t("user.settings.verified"));
  });
</script>

{#if user?.haspin && $pin?.length !== 6}
  <Pin />
{/if}

<form
  method="POST"
  class="mb-[154px] settings"
  onsubmit={handleSubmit}
  bind:this={formElement}
>
  <input type="hidden" name="pin" value={$pin} />
  <input type="hidden" name="tab" value={tab} />

  <div class="mt-24 mb-20 px-3 md:px-0 w-full md:max-w-lg mx-auto space-y-8">
    <div class="header">
      <h1 class="text-center text-3xl md:text-4xl font-semibold mb-10">
        {$t("user.settings.header")}
      </h1>

      <div
        class="flex flex-wrap justify-around items-center border-b pb-3"
      >
        {#each tabs as { name, key }}
          <a
            href={`/settings/${name}`}
            class="px-4 py-2 w-1/2 sm:w-1/4 flex-shrink-0 hover:opacity-80 transition-opacity duration-150 text-center"
            class:font-bold={name === tab}
          >
            {$t(`user.settings.${key}`)}
          </a>
        {/each}
      </div>
    </div>

    {@render children?.()}
  </div>

  <div
    class="z-10 fixed bottom-0 bg-base-100 shadow border-accent w-full flex justify-center items-center py-3"
  >
    <button
      bind:this={$save}
      type="submit"
      class="btn btn-accent !w-auto"
      class:bg-base-200={submitting}
    >
      {#if submitting}
        <Spinner />
      {:else}
        <iconify-icon icon="ph:floppy-disk-bold" width={32}></iconify-icon>
        <div class="my-auto">{$t("user.settings.saveSettings")}</div>
      {/if}
    </button>
  </div>
</form>
