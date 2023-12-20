<script>
  export let data;
  let { asset, ticket } = data;
</script>

<div class="mx-auto h-screen flex items-center justify-center px-4">
  <div class="font-normal text-gray-800 mx-auto mb-8 space-y-8">
    <h1
      class="mb-4 text-4xl font-bold leading-none tracking-tight text-gray-800 text-center"
    >
      Your Ticket
    </h1>

    <p>
      We've minted your ticket as an <a
        href={`https://blockstream.info/liquid/asset/${asset}`}
        class="underline">NFT on the Liquid Blockchain</a
      > as a proof of purchase and commemorative token.
    </p>

    <img
      src={`/tickets/${(ticket + 1).toString().padStart(2, "0")}.png`}
      class="w-full max-w-[800px]"
      alt="Ticket"
    />

    <div class="w-full flex">
      <a href="/" class="mx-auto">
        <button
          class="bg-black text-white border rounded-full px-8 py-4 font-bold hover:opacity-80 text-2xl"
        >
          Done
        </button>
      </a>
    </div>
  </div>
</div>
