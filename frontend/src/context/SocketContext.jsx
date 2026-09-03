import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [liveNotifications, setLiveNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("wtb_token");
    if (!user || !token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
    });

    socket.on("notification", (notification) => {
      setLiveNotifications((prev) => [notification, ...prev].slice(0, 20));
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={{ liveNotifications, setLiveNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
