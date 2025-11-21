import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/routes/api.js";
import { requestLogger, rateLimit } from "./src/middleware/decorators.js";
import cors from "cors";
import { initializeNotifiers } from "./src/services/notifiers/initializeNotifiers.js";

dotenv.config();
connectDB();

// Initialize notification observers (Observer Pattern)
initializeNotifiers();

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(rateLimit({ windowMs: 60000, max: 120 }));

// All user-related routes
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
