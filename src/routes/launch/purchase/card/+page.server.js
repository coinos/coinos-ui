let stripe = 'https://api.stripe.com/v1';

export const actions = {
	default: async ({ request }) => {
		let form = await request.formData();

		let headers = new Headers();
		headers.set(
			'Authorization',
			'Basic ' + new Buffer('sk_test_mBv5bAeAhiYSDYFZJNsDwjht:').toString('base64')
		);

		let body = new URLSearchParams({
			'card[number]': form.get('number'),
			'card[exp_month]': form.get('expiry').slice(0, 2),
			'card[exp_year]': form.get('expiry').slice(-2),
			'card[cvc]': form.get('cvc')
		});

		let method = 'POST';

		let { id: source } = await fetch(`${stripe}/tokens`, { body, headers, method }).then((r) =>
			r.json()
		);

		body = new URLSearchParams({
			amount: 600,
			currency: 'cad',
			source,
			description: 'launch ticket'
		});

		let r = await fetch(`${stripe}/charges`, { body, headers, method }).then((r) => r.json());

		console.log(r);
	}
};
