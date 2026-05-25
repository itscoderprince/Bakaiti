import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import { Connection } from "./db/Connection.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { config } from "./config/env.js";

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Database connection
Connection();

const port = config.PORT;

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

// Global Error Handler Middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
