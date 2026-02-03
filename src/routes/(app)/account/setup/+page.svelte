<script>
  import { t } from "$lib/translations";
</script>

<div class="space-y-5">
  <h1 class="text-center text-3xl font-semibold">Choose account type</h1>

  <div class="container w-full mx-auto text-lg px-4 max-w-xl space-y-5">
    <a href="/account/cash" class="block">
      <div class="shadow p-8 rounded-xl flex gap-4 hover:bg-primary">
        <img src="/images/cash.png" class="w-20 my-auto" alt="Cash account" />
        <div>
          <div class="text-xl">Cash</div>
          <div class="text-secondary">
            Your balance is held with a custodian. Payments are fast and free.
          </div>
        </div>
      </div>
    </a>
    <a href="/account/savings" class="block">
      <div class="shadow p-8 rounded-xl flex gap-4 hover:bg-primary">
        <img src="/images/keys.png" class="w-20 my-auto" alt="Savings account" />
        <div>
          <div class="text-xl">Savings</div>
          <div class="text-secondary">
            You hold the keys to the account and are responsible for
            safeguarding them.
          </div>
        </div>
      </div>
    </a>
  </div>
</div>
