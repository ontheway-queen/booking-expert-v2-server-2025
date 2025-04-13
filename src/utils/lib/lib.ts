import config from '../../config/config';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { Attachment } from 'nodemailer/lib/mailer';
import { TDB } from '../../features/public/utils/types/publicCommon.types';
import CommonModel from '../../models/commonModel/commonModel';

class Lib {
  // Create hash string
  public static async hashValue(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // verify hash string
  public static async compareHashValue(
    password: string,
    hashedPassword: string
  ) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // create token
  public static createToken(
    payload: object,
    secret: string,
    expiresIn: SignOptions['expiresIn']
  ) {
    return jwt.sign(payload, secret, { expiresIn });
  }

  // verify token
  public static verifyToken(token: string, secret: string) {
    try {
      return jwt.verify(token, secret);
    } catch (err) {
      return false;
    }
  }

  // generate random Number
  public static otpGenNumber(length: number) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    let otp = '';

    for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * 10);

      otp += numbers[randomNumber];
    }

    return otp;
  }

  public static async sendEmail(payload: {
    email: string;
    emailSub: string;
    emailBody: string;
    attachments?: Attachment[];
  }) {
    return await this.sendEmailDefault(payload);
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

  // compare object
  public static compareObj(a: any, b: any) {
    return JSON.stringify(a) == JSON.stringify(b);
  }

  // get time value
  public static getTimeValue(timeString: string) {
    // Extract hours, minutes, and seconds
    let [time, timeZone] = timeString.split('+');
    if (!timeZone) {
      [time, timeZone] = timeString.split('-');
    }
    let [hours, minutes, seconds] = time.split(':');

    // Convert to milliseconds since midnight
    let timeValue =
      (parseInt(hours, 10) * 60 * 60 +
        parseInt(minutes, 10) * 60 +
        parseInt(seconds, 10)) *
      1000;

    // Adjust for time zone
    if (timeZone) {
      let [tzHours, tzMinutes] = timeZone.split(':');
      let timeZoneOffset =
        (parseInt(tzHours, 10) * 60 + parseInt(tzMinutes, 10)) * 60 * 1000;
      timeValue -= timeZoneOffset;
    }

    return timeValue;
  }

  //get total amount after adding percentage
  public static getPaymentAmount(storeAmount: number, percentage: number) {
    return storeAmount / (1 - percentage / 100);
  }

  // Write file
  public static writeJsonFile(name: string, data: any) {
    const reqFilePath = path.join(`json/${name}.json`);

    fs.writeFile(reqFilePath, JSON.stringify(data, null, 4), (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log('JSON data has been written to', reqFilePath);
      }
    });
    // Write response in json data file======================
  }

  //convert time to locale string
  public static convertToLocaleString(time: any) {
    const completeTimeString = `1970-01-01T${time}`;

    // Parse the date and format it
    const date: any = new Date(completeTimeString);
    if (isNaN(date)) {
      return 'Invalid Date';
    }

    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
  }

  //get formatted date
  public static getFormattedDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return { year, month, day };
  }

  // generate Random pass
  public static generateRandomPassword(
    length: number,
    options: {
      includeUppercase?: boolean;
      includeNumbers?: boolean;
      includeSpecialChars?: boolean;
    } = {}
  ) {
    const {
      includeUppercase = true,
      includeNumbers = true,
      includeSpecialChars = true,
    } = options;

    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const specialChars = "!@#$%^&*()_+[]{}|;:',.<>?/";

    let characterPool = lowercaseChars;
    if (includeUppercase) characterPool += uppercaseChars;
    if (includeNumbers) characterPool += numberChars;
    if (includeSpecialChars) characterPool += specialChars;

    if (!characterPool) {
      throw new Error(
        'Character pool cannot be empty. Please enable at least one character type.'
      );
    }

    return Array.from(
      { length },
      () => characterPool[Math.floor(Math.random() * characterPool.length)]
    ).join('');
  }

  //remove country code from phone number
  public static removeCountryCodeFromPhoneNumber(phone_number: string) {
    if (phone_number.startsWith('0') && phone_number.length === 11) {
      return phone_number.slice(1); // Remove the first '0'
    } else if (phone_number.startsWith('+880')) {
      return phone_number.slice(4); // Remove the '+880'
    } else if (phone_number.startsWith('880')) {
      return phone_number.slice(3); // Remove the '880'
    } else {
      return phone_number; // Return the whole phone number if none of the conditions are met
    }
  }

  public static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? hours + ' hour' + (hours > 1 ? 's' : '') : ''} ${
      mins > 0 ? mins + ' minute' + (mins > 1 ? 's' : '') : ''
    }`.trim();
  }

  public static generateUsername(full_name: string) {
    const newName = full_name.split(' ').join('');
    return newName.toLowerCase();
  }

  public static async generateNo({ trx, type }: IGenNoParams) {
    let newId = 10001;
    const currYear = new Date().getFullYear();
    const commonModel = new CommonModel(trx);
    let NoCode = '';

    const lastId = await commonModel.getLastId({ type });

    if (lastId) {
      newId = lastId.last_id + 1;
      await commonModel.updateLastNo(
        { last_id: newId, last_update: new Date() },
        lastId?.id
      );
    } else {
      await commonModel.insertLastNo({
        last_id: newId,
        last_update: new Date(),
        type,
      });
    }

    switch (type) {
      case 'Agent':
        NoCode = 'A';
        break;
      case 'Agent_Flight':
        NoCode = 'AF';
        break;
      case 'Agent_GroupFare':
        NoCode = 'AGF';
        break;
      case 'Agent_Hotel':
        NoCode = 'AH';
        break;
      case 'Agent_Tour':
        NoCode = 'AT';
        break;
      case 'Agent_Umrah':
        NoCode = 'AU';
        break;
      case 'Agent_Visa':
        NoCode = 'AV';
        break;
      case 'Agent_SupportTicket':
        NoCode = 'AST';
        break;
      case 'User_Flight':
        NoCode = 'CF';
        break;
      case 'User_Tour':
        NoCode = 'CT';
        break;
      case 'User_Umrah':
        NoCode = 'CU';
        break;
      case 'User_Visa':
        NoCode = 'CV';
        break;
      case 'User_SupportTicket':
        NoCode = 'CST';
        break;
      default:
        break;
    }

    return 'BE' + NoCode + currYear + newId;
  }
}
export default Lib;

interface IGenNoParams {
  trx: TDB;
  type:
    | 'Agent'
    | 'Agent_Flight'
    | 'Agent_Visa'
    | 'Agent_Tour'
    | 'Agent_Umrah'
    | 'Agent_GroupFare'
    | 'Agent_SupportTicket'
    | 'Agent_Hotel'
    | 'User_Flight'
    | 'User_Visa'
    | 'User_Tour'
    | 'User_Umrah'
    | 'User_SupportTicket';
}
