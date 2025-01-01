<script lang="ts">
  import { t } from "$lib/translations";
  import PasswordInput from "$comp/PasswordInput.svelte";

  import { focus, fail, post } from "$lib/utils";
  import { password as pw, passwordPrompt } from "$lib/store";

  let { user } = $props();
  let password = $state();

  let cancel = () => ($passwordPrompt = false);

  let submit = async (e) => {
    e.preventDefault();
    try {
      let res = await post("/password", { password });
      $passwordPrompt = false;
      $pw = password;
    } catch (e) {
      console.log(e);
      fail("Invalid password, try again");
    }
  };
</script>

<div
  class="fixed inset-0 bg-base-100 bg-opacity-90 overflow-y-auto h-full w-full z-50"
>
  <div
    class="relative top-1/3 mx-auto p-5 border w-96 shadow-lg rounded-md bg-base-100 space-y-5"
  >
    <h1 class="text-center text-2xl font-semibold">
      {$t("user.settings.pleaseEnterYourPassword")}
    </h1>
    <form onsubmit={submit} class="space-y-2">
      <PasswordInput bind:value={password} {focus} />
      <div class="w-full flex gap-2">
        <button
          type="button"
          class="btn !w-auto grow"
          onclick={cancel}
          onkeydown={cancel}>{$t("payments.cancel")}</button
        >
        <button type="submit" class="btn btn-accent !w-auto grow"
          >{$t("payments.submit")}</button
        >
      </div>
    </form>
  </div>
</div>
