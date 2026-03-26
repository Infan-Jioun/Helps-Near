import express, { Router } from "express";
const router = express.Router();
router.post("/");
router.get("/");
router.get("/:id");
router.patch("/:id");
router.delete("/:id")
export const emergencyRouter: Router = router;