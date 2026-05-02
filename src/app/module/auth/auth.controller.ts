import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { authService } from "./auth.service";
import { ICreateUserPayload, ILoginUserPayload } from "./auth.interface";
import { sendResposne } from "../../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelper/appError";
import { cookieUtils } from "../../utils/cookie";
import { auth } from "../../lib/auth";
import { envConfig } from "../../../config/env";
import { prisma } from "../../lib/prisma";

const createUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await authService.createUser(payload as ICreateUserPayload);
    sendResposne(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Successfully user created!",
        data: result
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await authService.loginUser(payload as ILoginUserPayload);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Successfully user login!",
        data: { accessToken, refreshToken, ...rest }
    });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const result = await authService.getMyProfile(userId as string);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Profile fetched successfully",
        data: result,
    });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { otp, email } = req.body;
    const result = await authService.verifyEmail(otp, email);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: `Successfully email verfied ${email}`,
        data: result
    });
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.resendOtp(email);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: `Successfully OTP sent to ${email}`,
        data: result
    });
});

const logout = catchAsync(async (req: Request, res: Response) => {
    const betterAuthSessionToken = req.cookies["better-auth-session_token"];
    if (!betterAuthSessionToken) {
        throw new AppError(status.UNAUTHORIZED, "Already logged out!");
    }
    const result = await authService.logout(betterAuthSessionToken);
    cookieUtils.clearCookie(res, "accessToken", { httpOnly: true, secure: true, sameSite: "none", path: "/" });
    cookieUtils.clearCookie(res, "refreshToken", { httpOnly: true, secure: true, sameSite: "none", path: "/" });
    cookieUtils.clearCookie(res, "better-auth-session_token", { httpOnly: true, secure: true, sameSite: "none", path: "/" });
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Logout successfully",
        data: result
    });
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth-session_token"];
    if (!refreshToken) {
        throw new AppError(status.UNAUTHORIZED, "Refesh is missing");
    }
    const result = await authService.getNewToken(refreshToken, betterAuthSessionToken);
    const { newAccessToken, newRefreshToken, sessionToken } = result;
    tokenUtils.setAccessTokenCookie(res, newAccessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
    sendResposne(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "New token genarated successfully",
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken, sessionToken }
    });
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect || "/";
    const state = Buffer.from(JSON.stringify({ redirect: redirectPath })).toString("base64");

    const googleAuthURL = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthURL.searchParams.set("client_id", envConfig.GOOGLE_CLIENT_ID!);
    googleAuthURL.searchParams.set("redirect_uri", `${envConfig.BETTER_AUTH_URL}/api/v1/auth/login/google/callback`);
    googleAuthURL.searchParams.set("response_type", "code");
    googleAuthURL.searchParams.set("scope", "openid email profile");
    googleAuthURL.searchParams.set("state", state);

    res.redirect(googleAuthURL.toString());
});

const googleCallback = catchAsync(async (req: Request, res: Response) => {
    const { code, state } = req.query;

    if (!code) return res.redirect(`${envConfig.FRONTEND_URL}/login?error=oauth_failed`);

    const { redirect } = JSON.parse(Buffer.from(state as string, "base64").toString());

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code: code as string,
            client_id: envConfig.GOOGLE_CLIENT_ID!,
            client_secret: envConfig.GOOGLE_CLIENT_SECRET!,
            redirect_uri: `${envConfig.BETTER_AUTH_URL}/api/v1/auth/login/google/callback`,
            grant_type: "authorization_code",
        }),
    });

    const tokenData = await tokenRes.json() as { access_token?: string };

    if (!tokenData.access_token) {
        return res.redirect(`${envConfig.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userRes.json() as { email?: string; name?: string };

    if (!googleUser.email) {
        return res.redirect(`${envConfig.FRONTEND_URL}/login?error=no_user_found`);
    }

    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: googleUser.email,
                name: googleUser.name!,
                emailVerified: true,
            }
        });
    }


    const session = await prisma.session.create({
        data: {
            id: crypto.randomUUID(),
            userId: user.id,
            token: crypto.randomUUID(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ...(req.ip && { ipAddress: req.ip }),
            ...(req.headers["user-agent"] && { userAgent: req.headers["user-agent"] }),
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    });

    const accessToken = tokenUtils.getAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
    });
    const refreshToken = tokenUtils.getRefreshToken({
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
    });

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, session.token);

    const finalRedirect = (redirect as string)?.startsWith("/") ? redirect : "/";
    res.redirect(
        `${envConfig.FRONTEND_URL}${finalRedirect}?accessToken=${accessToken}&refreshToken=${refreshToken}&sessionToken=${session.token}`
    );
});
const handelAuthError = catchAsync((req: Request, res: Response) => {
    const error = req.query.error as string || "oauth_failed";
    res.redirect(`${envConfig.FRONTEND_URL}/login?error=${error}`);
});

export const authController = {
    createUser,
    loginUser,
    getMyProfile,
    verifyEmail,
    resendOtp,
    logout,
    getNewToken,
    googleLogin,
    googleCallback,
    handelAuthError
};