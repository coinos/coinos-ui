<script>
	import { AppHeader, Icon } from '$comp';
	import { user } from '$lib/store';
	export let username;

	console.log($user, username);
</script>

{#if $user?.username === username}
	<AppHeader />
	<div class="flex justify-center items-center mt-20 mb-3 px-3">
		<div class="space-y-3 w-full md:w-[300px] mx-auto">
			<div class="text-center">
				<b>Signed in as {username}</b>
			</div>

			<div>
				<a href="/logout" style="cursor: pointer">
					<button
						class="bg-primary rounded-xl w-full h-[48px] flex justify-center items-center font-semibold text-sm"
						><Icon icon="logout" style="mr-2" /> Logout</button
					>
				</a>
			</div>
		</div>
	</div>
{/if}
