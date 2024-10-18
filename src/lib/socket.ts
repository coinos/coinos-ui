import { navigating } from "$app/stores";
import { get } from "svelte/store";
import { event, invoice, request, last } from "$lib/store";
import { success, sat, sleep, wait } from "$lib/utils";
import { PUBLIC_SOCKET } from "$env/static/public";
import { invalidate } from "$app/navigation";

let socket;
let token;

export const auth = () => token && send("login", token);

export const send = async (type, data) => {
	try {
		await wait(() => socket && socket.readyState === 1, 100, 10);
	} catch (e: any) {
		if (e.message === "timeout") reconnectToWebsocket();
	}

	await wait(() => socket.readyState === 1, 100, 10);
	socket.send(JSON.stringify({ type, data }));
};

export const messages = (data) => ({
	id() {
		last.set(Date.now());
	},
	invoice() {
		invoice.set(data);
	},
	event() {
		event.set(data);
	},

	request() {
		request.set(data);
		invalidate("app:invoice");
	},

	async payment() {
		let { amount, confirmed } = data;
		invalidate("app:user");
		invalidate("app:invoice");
		invalidate("app:payments");

		if (amount > 0) {
			success(`${confirmed ? "Received" : "Detected"} ${sat(amount)}!`);
		}
	},

	connected: auth,
});

const initialReconnectDelay = 1000;
const maxReconnectDelay = 16000;

let currentReconnectDelay = initialReconnectDelay;

export function connect(t) {
	token = t;

	if (socket) return auth();

	socket = new WebSocket(PUBLIC_SOCKET);
	socket.addEventListener("open", onWebsocketOpen);
	socket.addEventListener("close", onWebsocketClose);
	socket.addEventListener("message", onWebsocketMessage);
}

export function close() {
	if (socket) socket.close();
}

async function onWebsocketMessage(msg) {
	let { type, data } = JSON.parse(msg.data);
	if (get(navigating)) await sleep(2000);

	messages(data)[type] && messages(data)[type]();
}

function onWebsocketOpen() {
	currentReconnectDelay = initialReconnectDelay;
}

function onWebsocketClose() {
	socket = null;
	setTimeout(
		() => {
			reconnectToWebsocket();
		},
		currentReconnectDelay + Math.floor(Math.random() * 3000),
	);
}

function reconnectToWebsocket() {
	if (currentReconnectDelay < maxReconnectDelay) {
		currentReconnectDelay *= 2;
	}
	connect(token);
}
