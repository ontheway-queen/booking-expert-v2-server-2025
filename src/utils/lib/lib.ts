import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { TDB } from '../../features/public/utils/types/publicCommon.types';
import CommonModel from '../../models/commonModel/commonModel';
import AgencyModel from '../../models/agentModel/agencyModel';
import SubAgentMarkupModel from '../../models/agentModel/subAgentMarkupModel';

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

  // compare object
  public static compareObj(a: any, b: any) {
    return JSON.stringify(a) == JSON.stringify(b);
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
      newId = Number(lastId.last_id) + 1;
      await commonModel.updateLastNo(
        { last_id: newId, last_updated: new Date() },
        lastId?.id
      );
    } else {
      await commonModel.insertLastNo({
        last_id: newId,
        last_updated: new Date(),
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
      case 'Agent_Deposit_Request':
        NoCode = 'ADR';
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
      case 'Money_Receipt':
        NoCode = 'MR';
        break;
      case 'Invoice':
        NoCode = 'INV';
        break;
      default:
        break;
    }

    return 'BE' + NoCode + currYear + newId;
  }

  public static async getAgentB2CTotalMarkup({
    trx,
    type,
    agency_id,
  }: {
    trx: TDB;
    type: 'Hotel' | 'Flight';
    agency_id: number;
  }) {
    const model = new AgencyModel(trx);
    const get_markup = await model.getAgentB2CMarkup(agency_id);
    if (!get_markup) {
      return null;
    }

    let markup = 0;
    let markup_type: 'FLAT' | 'PER';
    let markup_mode: 'INCREASE' | 'DECREASE';
    if (type === 'Flight') {
      markup = get_markup.flight_markup;
      markup_type = get_markup.flight_markup_type;
      markup_mode = get_markup.flight_markup_mode;
    } else {
      markup = get_markup.hotel_markup;
      markup_type = get_markup.hotel_markup_type;
      markup_mode = get_markup.hotel_markup_mode;
    }
    return {
      markup,
      markup_type,
      markup_mode,
    };
  }

  public static async getSubAgentTotalMarkup({
    trx,
    type,
    agency_id,
  }: {
    trx: TDB;
    type: 'Hotel' | 'Flight';
    agency_id: number;
  }) {
    const model = new SubAgentMarkupModel(trx);
    const get_markup = await model.getSubAgentMarkup(agency_id);
    if (!get_markup) {
      return null;
    }

    let markup = 0;
    let markup_type: 'FLAT' | 'PER';
    let markup_mode: 'INCREASE' | 'DECREASE';
    if (type === 'Flight') {
      markup = get_markup.flight_markup;
      markup_type = get_markup.flight_markup_type;
      markup_mode = get_markup.flight_markup_mode;
    } else {
      markup = get_markup.hotel_markup;
      markup_type = get_markup.hotel_markup_type;
      markup_mode = get_markup.hotel_markup_mode;
    }
    return {
      markup,
      markup_type,
      markup_mode,
    };
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
  | 'Agent_Deposit_Request'
  | 'User_Flight'
  | 'User_Visa'
  | 'User_Tour'
  | 'User_Umrah'
  | 'User_SupportTicket'
  | 'ADM_Management'
  | 'Money_Receipt'
  | 'Invoice';
}
