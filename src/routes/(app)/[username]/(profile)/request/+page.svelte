<script>
  import { t } from "$lib/translations";
  import { enhance } from "$app/forms";
  import { Icon } from "$comp";

  export let data;

  let { subject, user } = data;
</script>

<div class="container max-w-lg px-4 mx-auto mt-10 space-y-5">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">
    {$t("payments.requestAnInvoice")}
  </h1>

  <form action="?/create" method="POST" use:enhance class="space-y-5">
    <input type="hidden" name="requester_id" value={user.id} />
    <input type="hidden" name="recipient" value={subject.username} />

    <textarea
      name="memo"
      placeholder={$t("payments.describeOrder")}
      class="w-full p-4 border rounded-xl h-48"
    />

    <div class="w-full flex">
      <button
        type="submit"
        class="bg-black text-white border rounded-full px-6 py-2 font-bold mx-auto"
      >
        {$t("payments.submit")}
      </button>
    </div>
  </form>
</div>
