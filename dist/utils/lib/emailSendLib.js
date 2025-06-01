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
const nodemailer_1 = __importDefault(require("nodemailer"));
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
class EmailSendLib {
    static sendEmail(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.sendEmailHostinger(Object.assign(Object.assign({}, payload), { senderEmail: config_1.default.EMAIL_SEND_EMAIL_ID, senderPassword: config_1.default.EMAIL_SEND_PASSWORD }));
        });
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
    //generate email pdf
    static generateEmailPdfBuffer(htmlContent) {
        return __awaiter(this, void 0, void 0, function* () {
            const browser = yield puppeteer_extra_1.default.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--window-size=1920,1080',
                    '--disable-infobars',
                ],
            });
            const page = yield browser.newPage();
            yield page.setContent(htmlContent);
            const pdfBuffer = yield page.pdf();
            yield browser.close();
            return Buffer.from(pdfBuffer);
        });
    }
}
exports.default = EmailSendLib;
