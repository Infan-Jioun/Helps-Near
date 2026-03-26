import { Request, Response } from "express"
import catchAsync from "../../../shared/catchAsync"
import { emargencyService } from "./emergency.service";
import { sendResposne } from "../../../shared/sendResponse";
import status from "http-status";
import { ICreateEmargency } from "./emergency.interface";

const createEmargency = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const payload = req.body;
        const result = emargencyService.createEmargency(userId as string, payload as ICreateEmargency);
        sendResposne(res, {
            httpStatusCode: status.CREATED,
            message: "Successfully Create Emargency!",
            success: true,
            data: result
        })
    }
)
export const emargencyController = {
    createEmargency
}