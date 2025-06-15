"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const commonModel_1 = __importDefault(require("../../models/commonModel/commonModel"));
const agencyModel_1 = __importDefault(require("../../models/agentModel/agencyModel"));
class Lib {
    // Create hash string
    static hashValue(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcryptjs_1.default.genSalt(10);
            return yield bcryptjs_1.default.hash(password, salt);
        });
    }
    // verify hash string
    static compareHashValue(password, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcryptjs_1.default.compare(password, hashedPassword);
        });
    }
    // create token
    static createToken(payload, secret, expiresIn) {
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
    }
    // verify token
    static verifyToken(token, secret) {
        try {
            return jsonwebtoken_1.default.verify(token, secret);
        }
        catch (err) {
            return false;
        }
    }
    // generate random Number
    static otpGenNumber(length) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
        let otp = '';
        for (let i = 0; i < length; i++) {
            const randomNumber = Math.floor(Math.random() * 10);
            otp += numbers[randomNumber];
        }
        return otp;
    }
    // compare object
    static compareObj(a, b) {
        return JSON.stringify(a) == JSON.stringify(b);
    }
    //get total amount after adding percentage
    static getPaymentAmount(storeAmount, percentage) {
        return storeAmount / (1 - percentage / 100);
    }
    // Write file
    static writeJsonFile(name, data) {
        const reqFilePath = path_1.default.join(`json/${name}.json`);
        fs_1.default.writeFile(reqFilePath, JSON.stringify(data, null, 4), (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            }
            else {
                console.log('JSON data has been written to', reqFilePath);
            }
        });
        // Write response in json data file======================
    }
    // generate Random pass
    static generateRandomPassword(length, options = {}) {
        const { includeUppercase = true, includeNumbers = true, includeSpecialChars = true, } = options;
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numberChars = '0123456789';
        const specialChars = "!@#$%^&*()_+[]{}|;:',.<>?/";
        let characterPool = lowercaseChars;
        if (includeUppercase)
            characterPool += uppercaseChars;
        if (includeNumbers)
            characterPool += numberChars;
        if (includeSpecialChars)
            characterPool += specialChars;
        if (!characterPool) {
            throw new Error('Character pool cannot be empty. Please enable at least one character type.');
        }
        return Array.from({ length }, () => characterPool[Math.floor(Math.random() * characterPool.length)]).join('');
    }
    //remove country code from phone number
    static removeCountryCodeFromPhoneNumber(phone_number) {
        if (phone_number.startsWith('0') && phone_number.length === 11) {
            return phone_number.slice(1); // Remove the first '0'
        }
        else if (phone_number.startsWith('+880')) {
            return phone_number.slice(4); // Remove the '+880'
        }
        else if (phone_number.startsWith('880')) {
            return phone_number.slice(3); // Remove the '880'
        }
        else {
            return phone_number; // Return the whole phone number if none of the conditions are met
        }
    }
    static generateUsername(full_name) {
        const newName = full_name.split(' ').join('');
        return newName.toLowerCase();
    }
    static generateNo(_a) {
        return __awaiter(this, arguments, void 0, function* ({ trx, type }) {
            let newId = 10001;
            const currYear = new Date().getFullYear();
            const commonModel = new commonModel_1.default(trx);
            let NoCode = '';
            const lastId = yield commonModel.getLastId({ type });
            if (lastId) {
                newId = Number(lastId.last_id) + 1;
                yield commonModel.updateLastNo({ last_id: newId, last_updated: new Date() }, lastId === null || lastId === void 0 ? void 0 : lastId.id);
            }
            else {
                yield commonModel.insertLastNo({
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
        });
    }
    static getAgentB2CTotalMarkup(_a) {
        return __awaiter(this, arguments, void 0, function* ({ trx, type, agency_id, }) {
            const model = new agencyModel_1.default(trx);
            const get_markup = yield model.getAgentB2CMarkup(agency_id);
            if (!get_markup) {
                return null;
            }
            let markup = 0;
            let markup_type;
            let markup_mode;
            if (type === 'Flight') {
                markup = get_markup.flight_markup;
                markup_type = get_markup.flight_markup_type;
                markup_mode = get_markup.flight_markup_mode;
            }
            else {
                markup = get_markup.hotel_markup;
                markup_type = get_markup.hotel_markup_type;
                markup_mode = get_markup.hotel_markup_mode;
            }
            return {
                markup,
                markup_type,
                markup_mode,
            };
        });
    }
}
Lib.gibberishChecker = (value) => {
    var _a;
    const word = value.trim();
    // Must contain at least one vowel
    if (!/[aeiouAEIOU]/.test(word))
        return true;
    // Avoid long nonsense strings
    if (word.length > 20)
        return true;
    // Reject excessive repeated characters
    if (/(.)\1{2,}/.test(word))
        return true;
    // Reject repeated substrings like 'asdfasdf'
    const half = Math.floor(word.length / 2);
    const firstHalf = word.slice(0, half);
    const secondHalf = word.slice(half);
    if (firstHalf === secondHalf && firstHalf.length > 2)
        return true;
    // Vowel/consonant ratio check: require at least 1 vowel per 4 letters
    const vowels = ((_a = word.match(/[aeiou]/gi)) === null || _a === void 0 ? void 0 : _a.length) || 0;
    const ratio = vowels / word.length;
    if (ratio < 0.2)
        return true;
    return false;
};
exports.default = Lib;
