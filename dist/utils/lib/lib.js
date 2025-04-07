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
const config_1 = __importDefault(require("../../config/config"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Lib {
    // make hashed password
    static hashPass(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcryptjs_1.default.genSalt(10);
            return yield bcryptjs_1.default.hash(password, salt);
        });
    }
    // verify password
    static comparePass(password, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcryptjs_1.default.compare(password, hashedPassword);
        });
    }
    // create token
    static createToken(creds, secret, maxAge) {
        return jsonwebtoken_1.default.sign(creds, secret, {
            expiresIn: maxAge,
        });
    }
    // verify token
    static verifyToken(token, secret) {
        try {
            return jsonwebtoken_1.default.verify(token, secret);
        }
        catch (err) {
            console.log(err);
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
    // send email by nodemailer
    static sendEmailDefault(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, emailBody, emailSub, attachments, }) {
            try {
                const transporter = nodemailer_1.default.createTransport({
                    service: 'gmail',
                    host: 'smtp.gmail.com',
                    port: 465,
                    auth: {
                        user: config_1.default.EMAIL_SEND_EMAIL_ID,
                        pass: config_1.default.EMAIL_SEND_PASSWORD,
                    },
                });
                const info = yield transporter.sendMail({
                    from: config_1.default.EMAIL_SEND_EMAIL_ID,
                    to: email,
                    subject: emailSub,
                    html: emailBody,
                    attachments: attachments || undefined,
                });
                console.log('Message send: %s', info);
                return true;
            }
            catch (err) {
                console.log({ err });
                return false;
            }
        });
    }
    // send email google
    static sendEmailGoogle(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, emailBody, emailSub, attachments, senderEmail, senderPassword, }) {
            try {
                const transporter = nodemailer_1.default.createTransport({
                    service: 'gmail',
                    host: 'smtp.gmail.com',
                    port: 465,
                    auth: {
                        user: senderEmail,
                        pass: senderPassword,
                    },
                });
                const info = yield transporter.sendMail({
                    from: senderEmail,
                    to: email,
                    subject: emailSub,
                    html: emailBody,
                    attachments: attachments || undefined,
                });
                console.log('Message send: %s', info);
                return true;
            }
            catch (err) {
                console.log({ err });
                return false;
            }
        });
    }
    // send email hostinger
    static sendEmailHostinger(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, emailBody, emailSub, attachments, senderEmail, senderPassword, }) {
            try {
                const transporter = nodemailer_1.default.createTransport({
                    host: 'smtp.hostinger.com',
                    port: 465,
                    auth: {
                        user: senderEmail,
                        pass: senderPassword,
                    },
                });
                const info = yield transporter.sendMail({
                    from: senderEmail,
                    to: email,
                    subject: emailSub,
                    html: emailBody,
                    attachments: attachments || undefined,
                });
                console.log('Message send: %s', info);
                return true;
            }
            catch (err) {
                console.log({ err });
                return false;
            }
        });
    }
    // compare object
    static compareObj(a, b) {
        return JSON.stringify(a) == JSON.stringify(b);
    }
    // get time value
    static getTimeValue(timeString) {
        // Extract hours, minutes, and seconds
        let [time, timeZone] = timeString.split('+');
        if (!timeZone) {
            [time, timeZone] = timeString.split('-');
        }
        let [hours, minutes, seconds] = time.split(':');
        // Convert to milliseconds since midnight
        let timeValue = (parseInt(hours, 10) * 60 * 60 +
            parseInt(minutes, 10) * 60 +
            parseInt(seconds, 10)) *
            1000;
        // Adjust for time zone
        if (timeZone) {
            let [tzHours, tzMinutes] = timeZone.split(':');
            let timeZoneOffset = (parseInt(tzHours, 10) * 60 + parseInt(tzMinutes, 10)) * 60 * 1000;
            timeValue -= timeZoneOffset;
        }
        return timeValue;
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
    //convert time to locale string
    static convertToLocaleString(time) {
        const completeTimeString = `1970-01-01T${time}`;
        // Parse the date and format it
        const date = new Date(completeTimeString);
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
    static getFormattedDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        return { year, month, day };
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
    static formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours > 0 ? hours + ' hour' + (hours > 1 ? 's' : '') : ''} ${mins > 0 ? mins + ' minute' + (mins > 1 ? 's' : '') : ''}`.trim();
    }
}
exports.default = Lib;
