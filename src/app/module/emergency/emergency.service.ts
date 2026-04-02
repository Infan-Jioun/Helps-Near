
import status from "http-status";
import AppError from "../../errorHelper/appError";
import { prisma } from "../../lib/prisma";
import { ICreateEmargency, IUpdateEmergency } from "./emergency.interface"
import { IRequestUser } from "../../interface/requestUserInterface";
const getMyEmargencies = async (userId: string) => {
    try {
        const emergencies = await prisma.emergency.findMany({
            where: {
                userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        profileImage: true,
                        emergencies: {
                            select: {
                                id: true,
                                type: true,
                                description: true,
                                imageUrl: true,
                                latitude: true,
                                longitude: true,
                                address: true,
                                district: true,
                                isPriority: true,
                                status: true,
                                createdAt: true,
                                updatedAt: true,
                                responses: {
                                    select: {
                                        id: true,
                                        responderName: true,
                                        responderContact: true,
                                        message: true,
                                        createdAt: true,
                                    }
                                }
                            }
                        },
                        payments: {
                            select: {
                                id: true,
                                amount: true,
                                method: true,
                                status: true,
                                createdAt: true,
                                emergency: true
                            }
                        }
                    }
                }

            },
            orderBy: { createdAt: "desc" },
        });
        return emergencies;
    } catch (error: any) {
        console.error("getMyEmargencies error:", error);
        throw new AppError(status.BAD_REQUEST, error?.message || "Failed to fetch my emergencies");
    }
};
const createEmargency = async (userId: string, payload: ICreateEmargency) => {
    const result = await prisma.emergency.create({
        data: {
            ...payload,
            user: {
                connect: { id: userId }
            }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    profileImage: true,

                }
            }

        }

    })
    return result;
}
const getAllEmargencies = async () => {
    return await prisma.emergency.findMany({
        orderBy: [{ isPriority: "desc" }, { createdAt: "desc" }],
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });
};


const getEmargencyById = async (id: string, userId: string, userRole: string) => {
    const emergency = await prisma.emergency.findUnique({
        where: { id },
        include: {
            user: {
                select: { id: true, name: true, email: true, phone: true },
            },
            responses: true,
        },
    });

    if (!emergency) {
        throw new Error("Emergency not found");
    }
    if (userRole !== "ADMIN" && emergency.userId !== userId) {
        throw new Error("You are not authorized to view this emergency");
    }

    return emergency;
};
const updateEmargency = async (id: string, userId: string, userRole: string, payload: IUpdateEmergency) => {
    const emergency = await prisma.emergency.findUnique({ where: { id } });
    if (!emergency) throw new Error("Emergency not found");
    if (emergency.userId !== userId && userRole !== "ADMIN") {
        throw new Error("You are not authorized");
    }
    return await prisma.emergency.update({ where: { id }, data: payload });
};

const deleteEmargency = async (id: string, userId: string, userRole: string) => {
    const emergency = await prisma.emergency.findUnique({ where: { id } });
    if (!emergency) throw new Error("Emergency not found");
    if (emergency.userId !== userId && userRole !== "ADMIN") {
        throw new Error("You are not authorized");
    }
    await prisma.emergency.delete({ where: { id } });
    return null;
};

export const emargencyService = {
    createEmargency,
    getAllEmargencies,
    getMyEmargencies,
    getEmargencyById,
    updateEmargency,
    deleteEmargency
};