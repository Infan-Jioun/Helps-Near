import { betterAuth } from "better-auth";
import { envConfig } from "../../config/env";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP, oAuthProxy } from "better-auth/plugins";
import { sendEmail } from "../utils/email";
import { prisma } from "./prisma";
import { Role } from "../../generated/prisma/client/enums";


export const auth = betterAuth({
    baseURL: envConfig.BETTER_AUTH_URL,
    secret: envConfig.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true

    },
    emailVerification: {
        sendOnSignIn: true,
        sendOnSignUp: true,
        autoSignInAfterVerification: true
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.USER
            }
        }
    },
    plugins: [
        bearer(),
        emailOTP({
            overrideDefaultEmailVerification: true,
            async sendVerificationOTP({ email, otp, type }) {
                if (type === "email-verification") {
                    const user = await prisma.user.findUnique({
                        where: {
                            email
                        }
                    })
                    if (user && !user.emailVerified) {
                        sendEmail({
                            to: email,
                            subject: "Verify your email",
                            templateName: "otp",
                            templateData: {
                                name: user.name,
                                otp
                            },
                            attachments: []
                        })

                    }
                }
            },
            expiresIn: 10 * 60,
            otpLength: 6
        }),
            oAuthProxy()
    ],
    trustedOrigins: [
        "http://localhost:3000",
        process.env.FRONTEND_URL || "http://localhost:3000",
    ],
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 7,
        }
    },
    advanced: {
        useSecureCookies: false,
        cookies: {
            state: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    partitioned: true,
                },


            }, sessionToken: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    partitioned: true,
                }
            }
        }
    }

});