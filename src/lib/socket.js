import { rate, ws } from '$lib/store';
export const messages = (data) => ({
	rate() {
		rate.set(data);
	},

	payment() {
		console.log(data);
	}
});

const token =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJvYiIsImlhdCI6MTY1ODc5NDkxMX0._zFTEADrbLffcXa5sIMrJtJ483VdIiYmsdt2ofibxu4';
const initialReconnectDelay = 1000;
const maxReconnectDelay = 16000;

let currentReconnectDelay = initialReconnectDelay;
let socket;

export function connect() {
	socket = new WebSocket('ws://localhost:3119/ws');
	socket.addEventListener('open', onWebsocketOpen);
	socket.addEventListener('close', onWebsocketClose);
	socket.addEventListener('message', onWebsocketMessage);

	ws.set(socket);
}

function onWebsocketMessage(msg) {
	let { type, data } = JSON.parse(msg.data);
	messages(data)[type] && messages(data)[type]();
}

function onWebsocketOpen() {
	currentReconnectDelay = initialReconnectDelay;
	socket.send(JSON.stringify({ type: 'login', data: token }));
}

function onWebsocketClose() {
	ws.set(null);
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
