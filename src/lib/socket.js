import { get } from 'svelte/store';
import { invoices, invoice, request, newPayment, last, rate, txns, user } from '$lib/store';
import { success, sat } from '$lib/utils';
import { env } from '$env/dynamic/public';
import { invalidate } from '$app/navigation';

const socketUrl = env.PUBLIC_SOCKET;
const btc = env.PUBLIC_BTC;

let socket, token;

export const auth = () => token && send('login', token) && send('heartbeat');

export const send = (type, data) => {
	socket?.readyState === 1 && socket.send(JSON.stringify({ type, data }));
	return true;
};

export const messages = (data) => ({
	id() {
		last.set(Date.now());
	},

	invoice() {
		invoice.set(data);
	},

	rate() {
		rate.set(data);
	},

	request() {
		request.set(data);
		invalidate('app:invoice');
	},

	async payment() {
		let { amount, invoice } = data;

		if (invoice) invalidate('app:invoice');
		if (get(user)?.account_id !== data.account_id) return;

		let payments = get(txns);
		let i = payments.findIndex((p) => p.id === data.id);
		if (~i) (payments[i] = data), txns.set(payments);
		else newPayment.set(true);

		invalidate((url) => url.pathname === '/payments');

		if (amount > 0) {
			success(`${data.confirmed ? 'Received' : 'Detected'} ${sat(amount)}!`);
		} else {
			success(`Sent ${sat(amount)}!`);
		}
	},

	connected: auth
});

const initialReconnectDelay = 1000;
const maxReconnectDelay = 16000;

let currentReconnectDelay = initialReconnectDelay;

export function connect(t) {
	token = t;

	if (socket) return auth();

	socket = new WebSocket(socketUrl);
	socket.addEventListener('open', onWebsocketOpen);
	socket.addEventListener('close', onWebsocketClose);
	socket.addEventListener('message', onWebsocketMessage);
}

export function close() {
	if (socket) socket.close();
}

function onWebsocketMessage(msg) {
	let { type, data } = JSON.parse(msg.data);
	messages(data)[type] && messages(data)[type]();
}

function onWebsocketOpen() {
	currentReconnectDelay = initialReconnectDelay;
}

function onWebsocketClose() {
	socket = null;
	setTimeout(() => {
		reconnectToWebsocket();
	}, currentReconnectDelay + Math.floor(Math.random() * 3000));
}

function reconnectToWebsocket() {
	if (currentReconnectDelay < maxReconnectDelay) {
		currentReconnectDelay *= 2;
	}
	connect();
}
