import { Request, Response } from "express"
import catchAsync from "../../../shared/catchAsync"

const createEmargency = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.user?.id as string
    }
)
export const emargencyController = {
    createEmargency
}