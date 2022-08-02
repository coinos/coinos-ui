import { get } from 'svelte/store';
import { rate, user, token, invoicePaid, preferredCurrency } from '$lib/store';

let interval, socket;

export const auth = () => {
	let t = get(token);
	if (t) send('login', t);
};

export const send = (type, data) => {
	socket?.readyState === 1 && socket.send(JSON.stringify({ type, data }));
};

export const messages = (data) => ({
	rate() {
		rate.set(data);
	},

	payment() {
		invoicePaid.set(true);
	},

	connected: auth,

	login() {
		user.set(data);
		preferredCurrency.set(data.currency);
	}
});

const initialReconnectDelay = 1000;
const maxReconnectDelay = 16000;

let currentReconnectDelay = initialReconnectDelay;

export function connect() {
	clearInterval(interval);

	if (socket) return auth();

	socket = new WebSocket('ws://localhost:3119/ws');
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
