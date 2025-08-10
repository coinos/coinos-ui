<script>
  import { t } from "$lib/translations";
  import { password } from "$lib/store";

  let { data } = $props();
  let { user } = $derived(data);
  let email = $state();
</script>

<div
  class="mx-auto md:shadow-xl rounded-3xl max-w-xl w-full md:w-[480px] md:p-8 space-y-5 mb-20"
>
  <h1 class="text-2xl font-bold text-center">{$t("user.settings.welcome")}</h1>

  <div>We've created a new account for you.</div>

  <div>
    Username: <b>{user?.username}</b><br />
    Password: <b>{$password}</b>
  </div>

  <div>
    <div>Enter your email if you'd like us to send you a login link</div>
    <div class="flex mb-2">
      <input
        type="text"
        name="username"
        bind:value={email}
        placeholder="Email"
      />
    </div>
  </div>

  <div>{$t("user.settings.clickBelow")}</div>

  <a href="/settings/profile" class="btn">
    <iconify-icon icon="ph:gear-bold" width="32"></iconify-icon>
    Settings</a
  >
</div>
