<script>
  import { enhance } from "$app/forms";
  import Lock from "$comp/Lock.svelte";
  import Card from "$comp/Card.svelte";
  import Calendar from "$comp/Calendar.svelte";
  import Spinner from "$comp/Spinner.svelte";

  export let data;

  let { username } = data.user;
  let loading;
</script>

<div class="container max-w-lg px-4 mx-auto space-y-5">
  <form
    method="POST"
    class="flex flex-wrap gap-5 w-full p-5 mt-20"
    use:enhance={() => {
      loading = true;
      return ({ update }) => update() && (loading = false);
    }}
  >
    <input type="hidden" name="username" value={username} />
    <label class="relative w-full flex flex-col">
      <span class="font-bold mb-3">Card number</span>
      <input
        class="rounded-md peer pl-12 pr-2 py-2 border-2 border-gray-200 placeholder-gray-300"
        type="text"
        name="number"
        placeholder="0000 0000 0000 0000"
      />
      <Card />
    </label>

    <label class="relative flex-1 flex flex-col">
      <span class="font-bold mb-3">Expire date</span>
      <input
        class="rounded-md peer pl-12 pr-2 py-2 border-2 border-gray-200 placeholder-gray-300"
        type="text"
        name="expiry"
        placeholder="MM/YY"
      />
      <Calendar />
    </label>

    <label class="relative flex-1 flex flex-col">
      <span class="font-bold flex items-center gap-3 mb-3">
        CVC/CVV
        <span class="relative group">
          <span
            class="hidden group-hover:flex justify-center items-center px-2 py-1 text-xs absolute -right-2 transform translate-x-full -translate-y-1/2 w-max top-1/2 bg-black text-white"
          >
            3-digit number on the back of your card</span
          >
        </span>
      </span>
      <input
        class="rounded-md peer pl-12 pr-2 py-2 border-2 border-gray-200 placeholder-gray-300"
        type="text"
        name="cvc"
        placeholder="&bull;&bull;&bull;"
      />
      <Lock />
    </label>

    <div class="w-full flex mt-8">
      <button
        class="bg-black text-white border rounded-full px-8 py-4 font-bold hover:opacity-80 mx-auto text-xl"
        type="submit"
        disabled={loading}
      >
        {#if loading}
          <Spinner />
        {:else}
          Submit
        {/if}
      </button>
    </div>
  </form>
</div>
