import dotenv from "dotenv";
dotenv.config(); // musí být hned nahoře!

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import bidRoutes from "./routes/bidRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import setupSocket from "./socket/bidSocket.js";
import createSuperAdmin from "./utils/createSuperAdmin.js";
import adminRoutes from "./routes/adminRoutes.js";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB connected");
    await createSuperAdmin();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/bids", bidRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);

setupSocket(io);

server.listen(3001, "0.0.0.0", () => {
  console.log("Server běží na http://localhost:3001");
});
