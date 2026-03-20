import express, { Router } from "express"
import { authController } from "./auth.controller";
import { loginUserZodSchema, registerUserZodSchema } from "./auth.validation";
import { validateRequest } from "../../../middleware/validateRequest";
const router = express.Router();
router.post("/register", validateRequest(registerUserZodSchema), authController.createUser)
router.post("/login", validateRequest(loginUserZodSchema), authController.loginUser)
router.post("/verify-email", authController.verifyEmail)
router.post("/logout", authController.logout)
router.post("/refresh-token", authController.getNewToken)
export const authRouter: Router = router