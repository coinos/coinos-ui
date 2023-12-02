<script>
  import { Card, Icon } from "$comp";
  export let data;
  let { serial } = data;
  let balance = 0;
</script>

<div class="space-y-5">
  <div class="relative flex justify-center gap-2">
    <h1 class="text-2xl md:text-3xl font-semibold my-auto">Card {serial}</h1>
  </div>
  <div class="flex justify-center">
    <a href={`/send/pot/${serial}`}>
      <button
        class="rounded-full border py-3 px-6 font-bold hover:opacity-80 flex w-60 bg-black text-white justify-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="invert text-black peer-placeholder-shown:text-gray-300 h-6 w-6 my-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <div class="my-auto">Add Funds</div>
      </button>
    </a>
  </div>
</div>
