import express, { Application } from "express";
import cors from "cors"
import { envConfig } from "./config/env";
const app: Application = express();
app.use(cors({
    origin: [envConfig.FRONTEND_URL || "http://localhost:3000", envConfig.BETTER_AUTH_URL || "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["content-type", "Authorization"]
}))
app.use(express.json());
export default app;