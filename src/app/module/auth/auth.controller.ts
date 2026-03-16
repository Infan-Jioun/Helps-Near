import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { authService } from "./auth.service";
import { ICreateUserPayload } from "./auth.interface";
import { sendResposne } from "../../../shared/sendResponse";
import status from "http-status";

const createUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = authService.createUser(payload as ICreateUserPayload);
        sendResposne(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Successfully user created",
            data: result
        })
    }

)
export const authController = {
    createUser
}