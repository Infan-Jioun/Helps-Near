import express, { Router } from "express";
import { emargencyController } from "./emergency.controller";
import { checkAuth } from "../../../middleware/checkAuth";

const router = express.Router();

router.post("/", checkAuth("USER", "ADMIN", "VOLUNTEER"), emargencyController.createEmargency);
router.get("/", emargencyController.getAllEmargencies);
router.get("/:id", emargencyController.getEmargencyById);
router.patch("/:id", emargencyController.updateEmargency);
router.delete("/:id", emargencyController.deleteEmargency);

export const emergencyRouter: Router = router;