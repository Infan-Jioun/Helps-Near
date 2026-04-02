import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";

// ✅ Transporter (production safe)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SENDER_SMTP_HOST,
    port: Number(process.env.EMAIL_SENDER_SMTP_PORT) || 587,
    secure: false, // MUST false for 587
    auth: {
        user: process.env.EMAIL_SENDER_SMTP_USER,
        pass: process.env.EMAIL_SENDER_SMTP_PASS,
    },
});

// ✅ Debug (important)
export const verifyEmailConfig = async () => {
    try {
        await transporter.verify();
        console.log("✅ SMTP connection successful");
    } catch (error) {
        console.error("❌ SMTP connection failed:", error);
    }
};

type SendEmailOptions = {
    to: string;
    subject: string;
    templateName?: string;
    templateData?: Record<string, any>;
    html?: string;
    attachments?: {
        fileName: string;
        content: Buffer | string;
        contentType?: string;
    }[];
};

// ✅ Main function
export const sendEmail = async ({
    to,
    subject,
    templateName,
    templateData,
    html,
    attachments,
}: SendEmailOptions) => {
    try {
        let finalHtml = html;

        // ✅ Template support (SAFE PATH)
        if (templateName) {
            const templatePath = path.join(
                process.cwd(),
                "templates", // ⚠️ MUST be root level folder (NOT inside src)
                `${templateName}.ejs`
            );

            finalHtml = await ejs.renderFile(templatePath, templateData || {});
        }

        if (!finalHtml) {
            throw new Error("No HTML content provided");
        }

        const info = await transporter.sendMail({
            from: process.env.EMAIL_SENDER_SMTP_FROM,
            to,
            subject,
            html: finalHtml,
            attachments: attachments?.map((att) => ({
                filename: att.fileName, // ✅ FIXED
                content: att.content,
                contentType: att.contentType,
            })),
        });

        console.log("✅ Email sent:", info.messageId);
        return info;
    } catch (error: any) {
        console.error("❌ EMAIL ERROR FULL:", error);
        throw new Error("Failed to send email");
    }
};