import nodemailer from "nodemailer";
import { config } from "../config/env.js";

/**
 * Utility to send email via SMTP transporter.
 * If SMTP credentials are not configured, it falls back to console logging
 * for developer experience (mock mailing).
 *
 * @param {Object} options - { email, subject, message, html }
 * @returns {Promise<Object>} - Status metadata of dispatch
 */
export const sendEmail = async (options) => {
  // If SMTP host or user is not provided, mock it in console
  if (!config.SMTP_HOST || !config.SMTP_USER) {
    console.log("\n=======================================================");
    console.log("📨  [SMTP NOT CONFIGURING - DEV MOCK MAIL DISPATCH]  📨");
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.message}`);
    console.log("=======================================================\n");
    return { success: true, mocked: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: parseInt(config.SMTP_PORT || "587"),
      secure: config.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `${config.SMTP_FROM_NAME || "Vaanix Chat"} <${config.SMTP_FROM_EMAIL || config.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, mocked: false, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email dispatch failed:", error);
    // Throw error so the controller can handle it
    throw error;
  }
};
