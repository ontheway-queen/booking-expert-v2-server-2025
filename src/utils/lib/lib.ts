import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { TDB } from '../../features/public/utils/types/publicCommon.types';
import CommonModel from '../../models/commonModel/commonModel';
import AgencyModel from '../../models/agentModel/agencyModel';
import SubAgentMarkupModel from '../../models/agentModel/subAgentMarkupModel';
import {
  MarkupMode,
  MarkupType,
} from '../modelTypes/flightModelTypes/flightBookingModelTypes';

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
  public static generateRandomPassword(length: number) {
    const letters = `abc+[]{}|;depqrstuvwxyzABCDEFGH!@#$%^&*()_:',.<>?/IJKLMNOPQRSTUVWXYZ01234fghijklmno56789`;

    let randomNums = '';

    for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * letters.length);

      randomNums += letters[randomNumber];
    }

    return randomNums;
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
      case 'B2C_Deposit_Request':
        NoCode = 'DRQ';
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

  public static gibberishChecker = (value: string): boolean => {
    const word = value.trim();

    // Must contain at least one vowel
    if (!/[aeiouAEIOU]/.test(word)) return true;

    // Avoid long nonsense strings
    if (word.length > 20) return true;

    // Reject excessive repeated characters
    if (/(.)\1{2,}/.test(word)) return true;

    // Reject repeated substrings like 'asdfasdf'
    const half = Math.floor(word.length / 2);
    const firstHalf = word.slice(0, half);
    const secondHalf = word.slice(half);
    if (firstHalf === secondHalf && firstHalf.length > 2) return true;

    // Vowel/consonant ratio check: require at least 1 vowel per 4 letters
    const vowels = word.match(/[aeiou]/gi)?.length || 0;
    const ratio = vowels / word.length;
    if (ratio < 0.2) return true;

    return false;
  };

  public static async getSubAgentTotalMarkup({
    trx,
    type,
    agency_id,
  }: {
    trx: TDB;
    type: 'Hotel' | 'Flight';
    agency_id: number;
  }): Promise<{
    markup: number;
    markup_type: MarkupType;
    markup_mode: MarkupMode;
  } | null> {
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

  public static markupCalculation({
    amount,
    markup,
  }: {
    amount: number;
    markup: {
      markup: number;
      markup_type: 'PER' | 'FLAT';
      markup_mode: 'INCREASE' | 'DECREASE';
    };
  }) {
    let modifiedAmount = 0;

    if (markup.markup_type === 'FLAT') {
      modifiedAmount = markup.markup;
    }

    if (markup.markup_type === 'PER') {
      modifiedAmount = (amount * markup.markup) / 100;
    }

    if (markup.markup_mode === 'INCREASE') {
      amount += modifiedAmount;
    }
    if (markup.markup_mode === 'DECREASE') {
      amount -= modifiedAmount;
    }

    return amount;
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
    | 'Agent_B2C_SupportTicket'
    | 'Agent_Hotel'
    | 'Agent_Deposit_Request'
    | 'B2C_Deposit_Request'
    | 'User_Flight'
    | 'User_Visa'
    | 'User_Tour'
    | 'User_Umrah'
    | 'User_SupportTicket'
    | 'ADM_Management'
    | 'Money_Receipt'
    | 'Invoice';
}
