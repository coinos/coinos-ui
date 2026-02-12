import { goto, invalidate } from "$app/navigation";
import { navigating, page } from "$app/stores";
import { PUBLIC_SOCKET } from "$env/static/public";
import { event, invoice, last, request } from "$lib/store";
import { s, sleep, success, wait } from "$lib/utils";
import cookies from "js-cookie";
import { get } from "svelte/store";

export let socket;
let token;

export const auth = () => token && send("login", token);

export const send = async (type, data) => {
  try {
    await wait(() => socket?.readyState === 1, 1000, 10);
  } catch (e) {
    const { message } = e as Error;
    if (message === "timeout") reconnectToWebsocket();
  }

  await wait(() => socket?.readyState === 1, 1000, 10);
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
    const { amount, confirmed, iid } = data;
    invalidate("app:user");
    invalidate("app:invoice");
    invalidate("app:payments");

    const {
      url: { pathname },
    } = get(page);

    const username = cookies.get("username");

    if (amount > 0) {
      if (
        pathname.includes(`/${username}`) ||
        pathname.includes("/receive") ||
        pathname.includes("/invoice")
      ) {
        if (!get(navigating)) goto(`/invoice/${iid}`);
      } else success(`${confirmed ? "Received" : "Detected"} ⚡️${s(amount)}!`);
    }
  },

  connected: auth,
});

const initialReconnectDelay = 1000;
const maxReconnectDelay = 16000;

let currentReconnectDelay = initialReconnectDelay;

let connecting;
export function connect(t) {
  if (connecting) return;
  connecting = true;
  setTimeout(() => {
    connecting = false;
  }, 5000);

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
  const { type, data } = JSON.parse(msg.data);
  if (get(navigating)) await sleep(2000);

  if (messages(data)[type]) messages(data)[type]();
}

function onWebsocketOpen() {
  currentReconnectDelay = initialReconnectDelay;
  send("heartbeat", token);
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
