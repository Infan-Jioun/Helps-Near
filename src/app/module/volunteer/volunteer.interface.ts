import { VolunteerSkill } from "../../../generated/prisma/client/enums";





export interface IUpdateVolunteerProfile {
    name?: string,
    nidNumber?: string;
    skills?: VolunteerSkill[];
    bio?: string;
    latitude?: number;
    longitude?: number;
    isAvailable?: boolean;
}

export interface IVolunteerFilterRequest {
    isVerified?: boolean | undefined;
    isAvailable?: boolean   | undefined;
    skills?: VolunteerSkill;
    district?: string;
    page?: number;
    limit?: number;
}
