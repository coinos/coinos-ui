import { get } from 'svelte/store';
import { invoices, newPayment, rate, user } from '$lib/store';
import { success } from '$lib/utils';
import { env } from '$env/dynamic/public';

const socketUrl = env.PUBLIC_SOCKET;
const btc = env.PUBLIC_BTC;

let interval, socket, token;

export const auth = () => token && send('login', token);

export const send = (type, data) => {
	socket?.readyState === 1 && socket.send(JSON.stringify({ type, data }));
};

export const messages = (data) => ({
	rate() {
		rate.set(data);
	},

	async payment() {
		let { amount, invoice } = data;
		if (get(user).account_id !== data.account_id) return;

		if (invoice) {
			invoices.set({ ...get(invoices), [invoice.uuid]: invoice });
		}

		newPayment.set(true);
		if (amount > 0) {
			success(`Received ${amount} sats!`);
		} else {
			success(`Sent ${-amount} sats!`);
		}
	},

	connected: auth
});

const initialReconnectDelay = 1000;
const maxReconnectDelay = 16000;

let currentReconnectDelay = initialReconnectDelay;

export function connect(t) {
	token = t;

	clearInterval(interval);

	if (socket) return auth();

	socket = new WebSocket(socketUrl);
	socket.addEventListener('open', onWebsocketOpen);
	socket.addEventListener('close', onWebsocketClose);
	socket.addEventListener('message', onWebsocketMessage);

	interval = setInterval(() => send('heartbeat'), 5000);
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
