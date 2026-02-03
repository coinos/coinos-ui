<script>
  import { t } from "$lib/translations";
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">Choose wallet type</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
    <a href="/account/bitcoin" class="block">
      <div class="card card-side shadow shadow-base-300 p-8 hover:bg-base-200 gap-4 items-center">
        <iconify-icon noobserver icon="logos:bitcoin" width={48}></iconify-icon>
        <div>
          <div class="text-xl">Bitcoin (On-chain)</div>
          <div class="text-secondary">
            Standard Bitcoin wallet secured by a 12-word seed phrase. Full
            control over your UTXOs.
          </div>
        </div>
      </div>
    </a>
    <a href="/account/ark" class="block">
      <div class="card card-side shadow shadow-base-300 p-8 hover:bg-base-200 gap-4 items-center">
        <img
          src="/images/ark.png"
          class="w-12 h-12 rounded-full object-cover"
          alt="Ark"
        />
        <div>
          <div class="text-xl">Ark (Off-chain)</div>
          <div class="text-secondary">
            Fast, private transactions using virtual UTXOs. Lower fees with
            instant settlement.
          </div>
        </div>
      </div>
    </a>
  </div>
</div>
