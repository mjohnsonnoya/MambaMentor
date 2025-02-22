import { io } from "socket.io-client";

// Connect to your backend server (adjust the URL as needed)
export const socket = io("http://localhost:5432");
