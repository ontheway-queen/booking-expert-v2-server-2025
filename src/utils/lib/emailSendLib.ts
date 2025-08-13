import { Attachment } from 'nodemailer/lib/mailer';
import config from '../../config/config';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Knex } from 'knex';
import OthersModel from '../../models/othersModel/othersModel';
puppeteer.use(StealthPlugin());

export default class EmailSendLib {
  public static async sendEmail(payload: {
    email: string;
    emailSub: string;
    emailBody: string;
    attachments?: Attachment[];
  }) {
    return await this.sendEmailHostinger(payload, {
      senderEmail: config.EMAIL_SEND_EMAIL_ID,
      senderPassword: config.EMAIL_SEND_PASSWORD,
    });
  }

  public static async sendEmailAgent(
    trx: Knex.Transaction,
    agency_id: number,
    payload: {
      email: string;
      emailSub: string;
      emailBody: string;
      attachments?: Attachment[];
    }
  ) {
    const otherModel = new OthersModel(trx);

    const creds = await otherModel.getEmailCreds(agency_id);

    if (!creds) {
      return await this.sendEmailHostinger(payload, {
        senderEmail: config.EMAIL_SEND_EMAIL_ID,
        senderPassword: config.EMAIL_SEND_PASSWORD,
      });
    } else {
      switch (creds.type) {
        case 'GMAIL':
          return await this.sendEmailGoogle(payload, {
            senderEmail: creds.email,
            senderPassword: creds.password,
          });
        case 'HOSTINGER':
          return await this.sendEmailHostinger(payload, {
            senderEmail: creds.email,
            senderPassword: creds.password,
          });
        case 'NAMECHEAP':
          return await this.sendEmailNameCheap(payload, {
            senderEmail: creds.email,
            senderPassword: creds.password,
          });
        case 'CPANEL':
          return await this.sendEmailCpanel(payload, {
            senderEmail: creds.email,
            senderPassword: creds.password,
            host: creds.host || '',
            port: creds.port || 587,
          });

        default:
          break;
      }
    }
  }

  // send email google
  public static async sendEmailGoogle(
    {
      email,
      emailBody,
      emailSub,
      attachments,
    }: {
      email: string;
      emailSub: string;
      emailBody: string;
      attachments?: Attachment[];
    },
    {
      senderEmail,
      senderPassword,
    }: { senderEmail: string; senderPassword: string }
  ) {
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
  public static async sendEmailHostinger(
    {
      email,
      emailBody,
      emailSub,
      attachments,
    }: {
      email: string;
      emailSub: string;
      emailBody: string;
      attachments?: Attachment[];
    },
    {
      senderEmail,
      senderPassword,
    }: { senderEmail: string; senderPassword: string }
  ) {
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

  // send email by nodemailer
  public static async sendEmailCpanel(
    {
      email,
      emailBody,
      emailSub,
      attachments,
    }: {
      email: string;
      emailSub: string;
      emailBody: string;
      attachments?: Attachment[];
    },
    {
      host,
      port,
      senderEmail,
      senderPassword,
    }: {
      host: string;
      port: number;
      senderEmail: string;
      senderPassword: string;
    }
  ) {
    try {
      const transporter = nodemailer.createTransport({
        host: host,
        port: port,
        auth: {
          user: senderEmail,
          pass: senderPassword,
        },
        tls: {
          rejectUnauthorized: false,
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

  // send email by namecheap
  public static async sendEmailNameCheap(
    {
      email,
      emailBody,
      emailSub,
      attachments,
    }: {
      email: string;
      emailSub: string;
      emailBody: string;
      attachments?: Attachment[];
    },
    {
      senderEmail,
      senderPassword,
    }: { senderEmail: string; senderPassword: string }
  ) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'mail.privateemail.com',
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
  public static async generateEmailPdfBuffer(
    htmlContent: string
  ): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080',
        '--disable-infobars',
      ],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf();
    await browser.close();
    return Buffer.from(pdfBuffer);
  }
}
