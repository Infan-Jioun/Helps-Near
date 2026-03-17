import status from "http-status";
import { auth } from "../../lib/auth";
import { ICreateUserPayload } from "./auth.interface"
import AppError from "../../errorHelper/appError";
import { prisma } from "../../lib/prisma";
const createUser = async (payload: ICreateUserPayload) => {
    const { email, name, password } = payload;

    const userExists = await prisma.user.findFirst({
        where: { email }
    });

    if (userExists) {
        throw new AppError(status.BAD_REQUEST, "Already user exists!");
    }

    const data = await auth.api.signUpEmail({
        body: { name, email, password }
    });

    if (!data.user) {
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user!");
    }

    return data;
};
export const authService = {
    createUser
}