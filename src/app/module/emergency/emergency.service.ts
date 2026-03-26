import { prisma } from "../../lib/prisma"
import { ICreateEmargency } from "./emergency.interface"

const createEmargency = async (userId: string, payload: ICreateEmargency) => {
    const result = await prisma.emergency.create({
        data: {
            ...payload,
            userId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    emailVerified: true,
                    profileImage: true,
                    role: true
                }
            }

        }

    })
    return result;
}
export const emargencyService = {
    createEmargency
}