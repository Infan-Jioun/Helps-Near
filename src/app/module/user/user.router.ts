// import express, { Router } from "express";
// import { checkAuth } from "../../../middleware/checkAuth";
// import { Role } from "../../../generated/prisma/enums";
// import { validateRequest } from "../../../middleware/validateRequest";
// import { UserController } from "./user.controller";
// const router = express.Router();
// router.get("/", checkAuth(Role.ADMIN), UserController.getAllUsers);

// router.get("/:id", checkAuth(Role.ADMIN), UserController.getUserById);
// router.patch("/:id/role", checkAuth(Role.ADMIN), validateRequest(UserValidation.updateUserRoleSchema),
//     UserController.updateUserRole
// );

// router.patch(
//     "/:id/status",
//     checkAuth(Role.ADMIN),
//     validateRequest(UserValidation.updateUserStatusSchema),
//     UserController.updateUserStatus
// );
// export const userRouter: Router = router; 