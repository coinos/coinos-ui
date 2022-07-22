<script>
	import { Icon } from '$comp';

	export let page;

	let revealPassword = false;
</script>

<div class="pt-10">
	<a href="/">
		<Icon icon="logo" style="mx-auto mb-10" />
	</a>

	<div class="flex justify-center items-center">
		<div class="shadow-xl rounded-3xl p-10 pb-12 space-y-5 w-full mx-5 md:mx-0 md:w-[400px]">
			<h1 class="text-2xl font-bold text-center">{page}</h1>

			<form class="space-y-5">
				<div>
					<label for="username" class="font-semibold">Username</label>
					<input type="text" required class="bg-input p-4 rounded-2xl w-full" />
				</div>

				<div class="relative">
					<label for="password" class="block font-semibold">Password</label>
					<input
						type={revealPassword ? 'text' : 'password'}
						required
						class="block bg-input p-4 rounded-2xl w-full"
					/>
					<button
						type="button"
						on:click={() => (revealPassword = !revealPassword)}
						class="absolute right-5 top-10"
					>
						<Icon icon={revealPassword ? "eye" : 'eye-off'} />
					</button>
				</div>

				{#if page === 'Register'}
					<p class="text-secondary text-sm">
						We recommend a long, random password generated with a password manager.
					</p>
				{:else}
					<div class="flex justify-end items-center">
						<a href="" class="underline underline-offset-4 text-black text-sm">Forgot Password?</a>
					</div>
				{/if}

				<button type="submit" class="bg-black text-white w-full rounded-2xl p-4 font-semibold"
					>{page}
				</button>
			</form>

			<p class="text-secondary text-center font-medium">
				{page === 'Register' ? 'Already have an account?' : "Don't have an account?"}
				<a
					href={page === 'Register' ? '/login' : '/register'}
					class="block md:inline text-black underline underline-offset-4"
				>
					{page === 'Register' ? 'Sign in' : 'Register'}
				</a>
			</p>
		</div>
	</div>
</div>
