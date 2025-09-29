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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const config_1 = __importDefault(require("../../../config/config"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const emailSendLib_1 = __importDefault(require("../../../utils/lib/emailSendLib"));
const registrationCompleteTemplate_1 = require("../../../utils/templates/registrationCompleteTemplate");
class AuthAgentB2CService extends abstract_service_1.default {
    constructor() {
        super();
    }
    register(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const { email, phone_number, name, gender, password } = req.body;
                const { agency_id } = req.agencyB2CWhiteLabel;
                const AgentModel = this.Model.AgencyModel(trx);
                const AgentB2CUserModel = this.Model.AgencyB2CUserModel(trx);
                const files = req.files || [];
                const check_email = yield AgentB2CUserModel.checkUser({
                    email,
                    agency_id,
                });
                if (check_email) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'Email already exist. Please use another email.',
                    };
                }
                const agent_details = yield AgentModel.getSingleAgency({
                    id: agency_id,
                    type: constants_1.SOURCE_AGENT,
                });
                let username = lib_1.default.generateUsername(name);
                let suffix = 1;
                while (yield AgentB2CUserModel.checkUser({ username, agency_id })) {
                    username = `${username}${suffix}`;
                    suffix += 1;
                }
                const password_hash = yield lib_1.default.hashValue(password);
                const newUser = yield AgentB2CUserModel.createUser({
                    agency_id,
                    email,
                    password_hash,
                    name,
                    phone_number,
                    username,
                    gender,
                    photo: (_a = files === null || files === void 0 ? void 0 : files[0]) === null || _a === void 0 ? void 0 : _a.filename,
                });
                const tokenData = {
                    agency_id,
                    agency_name: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.agency_name),
                    agency_email: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.email),
                    agency_logo: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.agency_logo),
                    agency_address: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.address),
                    agency_number: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.phone),
                    user_id: newUser[0].id,
                    photo: (_b = files === null || files === void 0 ? void 0 : files[0]) === null || _b === void 0 ? void 0 : _b.filename,
                    user_email: email,
                    username,
                    name,
                    phone_number,
                };
                const AuthToken = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_AGENT_B2C, '24h');
                const white_label_permissions = yield AgentModel.getWhiteLabelPermission({ agency_id });
                yield emailSendLib_1.default.sendEmailAgent(trx, agency_id, {
                    email,
                    emailSub: 'Registration Completed',
                    emailBody: (0, registrationCompleteTemplate_1.registrationTemplate)({
                        agency: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.agency_name),
                        agency_phone: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.phone),
                        logo: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.agency_logo),
                        name,
                        website_link: (white_label_permissions === null || white_label_permissions === void 0 ? void 0 : white_label_permissions.b2c_link) || '',
                    }),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: `Registration has been completed`,
                    data: {
                        id: tokenData.user_id,
                        username,
                        email,
                        name: tokenData.name,
                        photo: tokenData.photo,
                        gender,
                    },
                    token: AuthToken,
                };
            }));
        });
    }
    login(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { password, user_or_email } = req.body;
                const { agency_id } = req.agencyB2CWhiteLabel;
                const AgentB2CUserModel = this.Model.AgencyB2CUserModel(trx);
                const AgentModel = this.Model.AgencyModel(trx);
                const AgencyB2CPaymentModel = this.Model.AgencyB2CPaymentModel(trx);
                const checkAgentB2C = yield AgentB2CUserModel.checkUser({
                    username: user_or_email,
                    email: user_or_email,
                    agency_id,
                });
                if (!checkAgentB2C) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                if (checkAgentB2C.status === false) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: 'Your account is disabled. Please contact with the authority!',
                    };
                }
                const agent_details = yield AgentModel.getSingleAgency({
                    id: agency_id,
                    type: constants_1.SOURCE_AGENT,
                });
                if (!agent_details) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.StatusCode.HTTP_UNAUTHORIZED,
                    };
                }
                if (agent_details.status !== 'Active') {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.StatusCode.HTTP_UNAUTHORIZED,
                    };
                }
                const checkPassword = yield lib_1.default.compareHashValue(password, checkAgentB2C.password_hash);
                if (!checkPassword) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                const balance = yield AgencyB2CPaymentModel.getUserBalance(agency_id, checkAgentB2C.id);
                const tokenData = {
                    agency_id,
                    agency_name: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.agency_name),
                    agency_email: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.email),
                    agency_logo: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.agency_logo),
                    agency_address: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.address),
                    agency_number: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.phone),
                    user_id: checkAgentB2C.id,
                    photo: checkAgentB2C.photo,
                    user_email: checkAgentB2C.email,
                    username: checkAgentB2C.username,
                    name: checkAgentB2C.name,
                    phone_number: checkAgentB2C.phone_number,
                };
                const AuthToken = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_AGENT_B2C, '24h');
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.LOGIN_SUCCESSFUL,
                    data: {
                        id: tokenData.user_id,
                        username: checkAgentB2C.username,
                        balance,
                        email: tokenData.user_email,
                        name: tokenData.name,
                        photo: tokenData.photo,
                        gender: checkAgentB2C.gender,
                    },
                    token: AuthToken,
                };
            }));
        });
    }
    resetPassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyB2CWhiteLabel;
            const { password, token } = req.body;
            const data = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_AGENT_B2C + constants_1.OTP_TYPES.reset_agent_b2c);
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: this.ResMsg.HTTP_UNAUTHORIZED,
                };
            }
            const { email, type } = data;
            if (type !== constants_1.OTP_TYPES.reset_agent_b2c) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_FORBIDDEN,
                    message: this.StatusCode.HTTP_FORBIDDEN,
                };
            }
            const AgencyB2CUserModel = this.Model.AgencyB2CUserModel();
            const password_hash = yield lib_1.default.hashValue(password);
            yield AgencyB2CUserModel.updateUserByEmail({ password_hash }, email, agency_id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.PASSWORD_CHANGED,
            };
        });
    }
}
exports.default = AuthAgentB2CService;
