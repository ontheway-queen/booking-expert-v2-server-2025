import { Attachment } from 'nodemailer/lib/mailer';
import config from '../../config/config';
import nodemailer from 'nodemailer';
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

export default class EmailSendLib {
  public static async sendEmail(payload: {
    email: string;
    emailSub: string;
    emailBody: string;
    attachments?: Attachment[];
  }) {
    return await this.sendEmailHostinger({
      ...payload,
      senderEmail: config.EMAIL_SEND_EMAIL_ID,
      senderPassword: config.EMAIL_SEND_PASSWORD,
    });
  }

  // send email by nodemailer
  private static async sendEmailDefault({
    email,
    emailBody,
    emailSub,
    attachments,
  }: {
    email: string;
    emailSub: string;
    emailBody: string;
    attachments?: Attachment[];
  }) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
          user: config.EMAIL_SEND_EMAIL_ID,
          pass: config.EMAIL_SEND_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: config.EMAIL_SEND_EMAIL_ID,
        to: email,
        subject: emailSub,
        html: emailBody,
        attachments: attachments || undefined,
      });

      console.log('Message send: %s', info);

      return true;
    } catch (err: any) {
      console.log({ err });
      return false;
    }
  }

  // send email google
  private static async sendEmailGoogle({
    email,
    emailBody,
    emailSub,
    attachments,
    senderEmail,
    senderPassword,
  }: {
    email: string;
    emailSub: string;
    emailBody: string;
    attachments?: Attachment[];
    senderEmail: string;
    senderPassword: string;
  }) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
          user: senderEmail,
          pass: senderPassword,
        },
      });

      const info = await transporter.sendMail({
        from: senderEmail,
        to: email,
        subject: emailSub,
        html: emailBody,
        attachments: attachments || undefined,
      });

      console.log('Message send: %s', info);

      return true;
    } catch (err: any) {
      console.log({ err });
      return false;
    }
  }

  // send email hostinger
  private static async sendEmailHostinger({
    email,
    emailBody,
    emailSub,
    attachments,
    senderEmail,
    senderPassword,
  }: {
    email: string;
    emailSub: string;
    emailBody: string;
    attachments?: Attachment[];
    senderEmail: string;
    senderPassword: string;
  }) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        auth: {
          user: senderEmail,
          pass: senderPassword,
        },
      });

      const info = await transporter.sendMail({
        from: senderEmail,
        to: email,
        subject: emailSub,
        html: emailBody,
        attachments: attachments || undefined,
      });

      console.log('Message send: %s', info);

      return true;
    } catch (err: any) {
      console.log({ err });
      return false;
    }
  }

  //generate email pdf
  public static async generateEmailPdfBuffer(htmlContent: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--window-size=1920,1080",
        "--disable-infobars",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf();
    await browser.close();
    return Buffer.from(pdfBuffer);
  }
}
