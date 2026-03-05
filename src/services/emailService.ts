import nodemailer from "nodemailer";
import { EmailJobPayload } from "../schemas/emailSchema";
import { logger } from "../utils/logger";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  logger.info(`Ethereal test account created: ${testAccount.user}`);
  return transporter;
};

export interface EmailResult {
  messageId: string;
  previewUrl: string | false;
}

export const sendEmail = async (
  payload: EmailJobPayload
): Promise<EmailResult> => {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: '"Job Queue API" <noreply@jobqueue.dev>',
    to: payload.to,
    subject: payload.subject,
    html: payload.body,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);

  logger.info(`Email sent: ${info.messageId} | Preview: ${previewUrl}`);

  return {
    messageId: info.messageId,
    previewUrl,
  };
};
