import express, { Router } from "express"
import { authController } from "./auth.controller";
const router = express.Router();
router.post("/register", authController.createUser)
export const authRouter: Router = router