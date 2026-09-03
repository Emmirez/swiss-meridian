import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

export const initSocket = (httpServer) => {
  const allowedOrigins = [
    process.env.CLIENT_URL,
    "https://swissmeridianapp.com",
    "https://www.swissmeridianapp.com",
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // Each user joins a private room keyed by their own user id
    socket.join(socket.userId);

    socket.on("disconnect", () => {
      // no-op — room membership cleans up automatically
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
