<script>
	import { Avatar } from '$comp';
	export let tags;

	let addr = (tags) => {
		let { 'addr:housenumber': house, 'addr:street': street, 'addr:city': city } = tags;
		if (house) return `${house} ${street}, ${city}`;
		if (street) return `${street}, ${city}`;
		if (city) return city;
		return '';
	};
</script>

{#if tags}
	<span class="block font-bold">{tags.name}</span>

	<span class="block">{addr(tags)}</span>

	{#if tags.phone}
		<a href="tel:${tags.phone}" class="block">{tags.phone}</a>
	{/if}

	{#if tags.website}
		<a href="${tags.website}" target="_blank" rel="noreferrer" class="block text-blue-400 break-all"
			>{tags.website}</a
		>
	{/if}

	{#if tags.user}
    <a href={`/${tags.user.username}`}>
		<div class="flex gap-1">
			<Avatar user={tags.user} size={16} />
			<div class="my-auto">
				{tags.user.username}
			</div>
		</div>
    </a>
	{/if}

{/if}
