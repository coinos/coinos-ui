export async function load({ depends, parent }) {
	depends('app:user');
	let { subject } = await parent();
	console.log('SUBJ', subject);
	return { subject };
}
