import { z } from "zod";
import status from "http-status";
import { handelZodError } from "../app/errorHelper/handelZodError";
import AppError from "../app/errorHelper/appError";
import { Prisma } from "../generated/prisma/client/client";

export const globalErrorHandlar = (err: unknown) => {
    let statusCode = status.INTERNAL_SERVER_ERROR as number;
    let message = "Something went wrong";
    let errorSource: { path: string; message: string }[] = [];
    let stack = "";

    if (err instanceof z.ZodError) {
        const simplifiedError = handelZodError(err);
        statusCode = simplifiedError.statusCode as number;
        message = simplifiedError.message;
        errorSource = [...(simplifiedError.errorSource ?? [])];
        stack = err.stack || "";

    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        stack = err.stack || "";
        errorSource = [{ path: "", message: err.message }];

    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case "P2002":
                statusCode = status.CONFLICT;
                message = "Already exists";
                errorSource = [{
                    path: (err.meta?.target as string[])?.join(", ") ?? "",
                    message: `Duplicate value on field: ${(err.meta?.target as string[])?.join(", ")}`,
                }];
                break;
            case "P2025":
                statusCode = status.NOT_FOUND;
                message = "Not found";
                errorSource = [{ path: "", message: "The requested record does not exist" }];
                break;
            case "P2003":
                statusCode = status.BAD_REQUEST;
                message = "Invalid reference";
                errorSource = [{ path: "", message: "Related record not found" }];
                break;
            case "P2014":
                statusCode = status.BAD_REQUEST;
                message = "Invalid relation";
                errorSource = [{ path: "", message: "The relation constraint would be violated" }];
                break;
            default:
                statusCode = status.INTERNAL_SERVER_ERROR;
                message = "Database error";
                errorSource = [{ path: "", message: err.message }];
        }
        stack = err.stack || "";

    } else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = status.BAD_REQUEST;
        message = "Invalid data provided";
        errorSource = [{ path: "", message: "Validation failed on database query" }];
        stack = err.stack || "";

    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        statusCode = status.SERVICE_UNAVAILABLE;
        message = "Database connection failed";
        errorSource = [{ path: "", message: "Could not connect to the database" }];
        stack = err.stack || "";

    } else if (err instanceof Error) {
        const msg = err.message.toLowerCase();

        // ─── Account not found ────────────────────────────────────
        if (
            msg.includes("user not found") ||
            msg.includes("account not found") ||
            msg.includes("no user found") ||
            msg.includes("does not exist")
        ) {
            statusCode = status.NOT_FOUND;
            message = "Account not found";
            errorSource = [{ path: "email", message: "No account found with this email address" }];

            // ─── Invalid password ─────────────────────────────────────
        } else if (
            msg.includes("invalid password") ||
            msg.includes("incorrect password") ||
            msg.includes("wrong password") ||
            msg.includes("password mismatch") ||
            msg.includes("invalid credentials")
        ) {
            statusCode = status.UNAUTHORIZED;
            message = "Invalid credentials";
            errorSource = [{ path: "password", message: "The password you entered is incorrect" }];

            // ─── Email not verified ───────────────────────────────────
        } else if (
            msg.includes("email not verified") ||
            msg.includes("verify your email") ||
            msg.includes("not verified")
        ) {
            statusCode = status.FORBIDDEN;
            message = "Email not verified";
            errorSource = [{ path: "email", message: "Please verify your email before logging in" }];

            // ─── Account blocked / suspended ──────────────────────────
        } else if (
            msg.includes("blocked") ||
            msg.includes("suspended") ||
            msg.includes("banned") ||
            msg.includes("disabled")
        ) {
            statusCode = status.FORBIDDEN;
            message = "Account suspended";
            errorSource = [{ path: "", message: "Your account has been blocked. Please contact support" }];

            // ─── Token expired ────────────────────────────────────────
        } else if (
            msg.includes("jwt expired") ||
            msg.includes("token expired")
        ) {
            statusCode = status.UNAUTHORIZED;
            message = "Session expired";
            errorSource = [{ path: "token", message: "Your session has expired. Please log in again" }];

            // ─── Invalid token ────────────────────────────────────────
        } else if (
            msg.includes("invalid token") ||
            msg.includes("jwt malformed") ||
            msg.includes("invalid signature")
        ) {
            statusCode = status.UNAUTHORIZED;
            message = "Invalid token";
            errorSource = [{ path: "token", message: "Authentication token is invalid" }];

            // ─── Rate limit ───────────────────────────────────────────
        } else if (
            msg.includes("too many requests") ||
            msg.includes("rate limit")
        ) {
            statusCode = status.TOO_MANY_REQUESTS;
            message = "Too many requests";
            errorSource = [{ path: "", message: "Please wait a moment before trying again" }];

            // ─── Fallback ─────────────────────────────────────────────
        } else {
            statusCode = status.INTERNAL_SERVER_ERROR;
            message = err.message;
            errorSource = [{ path: "", message: err.message }];
        }

        stack = err.stack || "";
    }

    return {
        statusCode,
        message,
        errorSource,
        stack,
    };
};