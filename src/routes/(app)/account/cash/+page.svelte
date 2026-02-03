<script>
  import { t } from "$lib/translations";
  import Icon from "$comp/Icon.svelte";
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">Choose your custodian</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-2">
    <div class="space-y-5">
      <a href="/account/cash" class="block">
        <div class="shadow p-8 rounded-xl flex gap-4 hover:bg-primary">
          <img src="/icons/logo-symbol.svg" class="w-20" alt="Coinos" />
          <div>
            <div class="text-xl">Coinos</div>
            <div class="text-secondary">https://mint.coinos.io</div>
          </div>
        </div>
      </a>
      <a href="/account/cash" class="block">
        <div class="shadow p-8 rounded-xl flex gap-4 hover:bg-primary">
          <img src="/images/minibits.png" class="w-20" alt="Minibits" />
          <div>
            <div class="text-xl">Minibits</div>
            <div class="text-secondary">https://mint.minibits.cash/bitcoin</div>
          </div>
        </div>
      </a>
    </div>
    <!-- <a href="/account/mints" class="block"> -->
    <!--   <div class="p-4 border rounded-xl flex justify-center gap-2"> -->
    <!--     <Icon icon="plus" style="w-8 my-auto" /> -->
    <!--     <div class="text-xl my-auto">More</div> -->
    <!--   </div> -->
    <!-- </a> -->
  </div>
</div>
