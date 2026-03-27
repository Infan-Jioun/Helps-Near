import { Role, Status, BloodGroup } from "../../../generated/prisma/enums";

export interface IUpdateUserRole {
    role: Role;
}

export interface IUpdateUserStatus {
    status: Status;
}

export interface IUpdateMyProfile {
    name?: string;
    phone?: string;
    profileImage?: string;
    bloodGroup?: BloodGroup;
    latitude?: number;
    longitude?: number;
}

export interface IUserFilterRequest {
    role?: Role;
    status?: Status;
    searchTerm?: string;
    page?: number;
    limit?: number;
}
