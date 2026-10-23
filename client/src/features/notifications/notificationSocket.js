import { io } from "socket.io-client";

export const createNotificationSocket = () =>
  io("http://localhost:4007", {
    withCredentials: true,
    autoConnect: false,
    transports: ["websocket"],
  });
