<script>
	import { t } from '$lib/translations';
	import { enhance } from '$app/forms';
	import { Icon } from '$comp';
	import { back } from '$lib/utils';

	export let data;
	export let form;

	let { subject, user } = data;
</script>

<button class="ml-5 md:ml-20 mt-10 hover:opacity-80" on:click={back}>
	<Icon icon="arrow-left" style="w-10" />
</button>

<div class="container max-w-lg px-4 mx-auto mt-10 space-y-5">
  <h1 class="px-3 md:px-0 text-center text-3xl md:text-4xl font-semibold">{$t("transactions.requestAnInvoice")}</h1>

	<form action="?/create" method="POST" use:enhance class="space-y-5">
		<input type="hidden" name="requester_id" value={user.id} />
		<input type="hidden" name="recipient" value={subject.username} />

		<textarea
			name="memo"
   placeholder={$t("transactions.describeOrder")}
			class="w-full p-4 border rounded-xl h-48"
		/>

		<div class="w-full flex">
			<button
				type="submit"
				class="bg-black text-white border rounded-full px-6 py-2 font-bold mx-auto"
			>
        {$t("transactions.submit")}
			</button>
		</div>
	</form>
</div>
