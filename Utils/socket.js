let socket = null;
let isConnecting = false;
let messageQueue = [];

const listeners = new Set();

export const getSocket = () => {
  if (!socket && !isConnecting) {
    isConnecting = true;

    socket = new WebSocket("ws://192.168.1.104:8000/ws");

    socket.onopen = () => {
      console.log("Socket connected");
      isConnecting = false;
      
      while (messageQueue.length > 0) {
        const msg = messageQueue.shift();
        socket.send(JSON.stringify(msg));
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        listeners.forEach((cb) => cb(data));
      } catch (e) {
        console.log("Parse error:", e);
      }
    };

    socket.onerror = (e) => {
      console.log("Socket error:", e.message);
    };

    socket.onclose = () => {
      console.log("Socket closed");
      socket = null;
      isConnecting = false;
      messageQueue = [];
    };
  }

  return socket;
};

export const subscribe = (callback) => {
  listeners.add(callback);

  return () => {
    listeners.delete(callback);
  };
};

export const sendMessage = (data) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else if (isConnecting || (socket && socket.readyState === WebSocket.CONNECTING)) {
    messageQueue.push(data);
  } else {
    console.log("Socket entirely closed or missing:", data);
  }
};

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  listeners.clear();
};