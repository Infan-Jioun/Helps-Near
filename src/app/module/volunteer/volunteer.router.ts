import express, { Router } from "express";
import { checkAuth } from "../../../middleware/checkAuth";
import { validateRequest } from "../../../middleware/validateRequest";
import { volunteerController } from "./volunteer.controller";
import { volunteerValidation } from "./volunteer.validation";
import { Role } from "../../../generated/prisma/client/enums";
const router = express.Router();
router.get("/", checkAuth(Role.ADMIN), volunteerController.getAllVolunteers)
router.get(
    "/myprofile",
    checkAuth(Role.VOLUNTEER),
    volunteerController.getMyVolunteerProfile
);
router.patch(
    "/myprofile",
    checkAuth(Role.VOLUNTEER),
    validateRequest(volunteerValidation.updateVolunteerProfileSchema),
    volunteerController.updateMyVolunteerProfile
);


router.get("/:userId", volunteerController.getVolunteerById);

router.patch(
    "/:userId",
    checkAuth(Role.ADMIN),
    volunteerController.verifyVolunteer
);

router.delete(
    "/:userId",
    checkAuth(Role.ADMIN),
    volunteerController.deleteVolunteer
);

export const volunteerRouter: Router = router;