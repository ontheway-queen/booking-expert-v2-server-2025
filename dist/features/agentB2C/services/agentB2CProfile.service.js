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
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
class AgentB2CProfileService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id, agency_id } = req.agencyB2CUser;
                const { blog, flight, group_fare, holiday, hotel, umrah, visa } = req.agencyB2CWhiteLabel;
                const AgencyB2CUserModel = this.Model.AgencyB2CUserModel(trx);
                const AgentModel = this.Model.AgencyModel(trx);
                const AgencyB2CPaymentModel = this.Model.AgencyB2CPaymentModel(trx);
                const checkAgentB2C = yield AgencyB2CUserModel.checkUser({
                    id: user_id,
                    agency_id,
                });
                if (!checkAgentB2C) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const agent_details = yield AgentModel.getSingleAgency(agency_id);
                const balance = yield AgencyB2CPaymentModel.getUserBalance(agency_id, user_id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: {
                        agency_id,
                        agency_name: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.agency_name),
                        agency_email: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.email),
                        agency_logo: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.agency_logo),
                        agency_address: String(agent_details === null || agent_details === void 0 ? void 0 : agent_details.address),
                        user_id: checkAgentB2C.id,
                        balance,
                        photo: checkAgentB2C.photo,
                        user_email: checkAgentB2C.email,
                        username: checkAgentB2C.username,
                        gender: checkAgentB2C.gender,
                        name: checkAgentB2C.name,
                        phone_number: checkAgentB2C.phone_number,
                        blog,
                        flight,
                        group_fare,
                        holiday,
                        hotel,
                        umrah,
                        visa,
                    },
                };
            }));
        });
    }
    updateProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id, agency_id } = req.agencyB2CUser;
                const body = req.body;
                const AgencyB2CUserModel = this.Model.AgencyB2CUserModel(trx);
                const checkAgentB2C = yield AgencyB2CUserModel.checkUser({
                    id: user_id,
                    agency_id,
                });
                if (!checkAgentB2C) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const files = req.files || [];
                const payload = Object.assign({}, body);
                if (files.length === 1 || files.length === 0) {
                    files.forEach((file) => __awaiter(this, void 0, void 0, function* () {
                        payload.photo = file.filename;
                    }));
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
                if (!Object.keys(payload).length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
                yield AgencyB2CUserModel.updateUser(payload, user_id, agency_id);
                if (checkAgentB2C.photo && payload.photo) {
                    yield this.manageFile.deleteFromCloud([checkAgentB2C.photo]);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        photo: payload.photo,
                    },
                };
            }));
        });
    }
    changePassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id, agency_id } = req.agencyB2CUser;
            const { new_password, old_password } = req.body;
            const AgencyB2CUserModel = this.Model.AgencyB2CUserModel();
            const checkUser = yield AgencyB2CUserModel.checkUser({
                id: user_id,
                agency_id,
            });
            if (!checkUser) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const checkPass = yield lib_1.default.compareHashValue(old_password, checkUser.password_hash);
            if (!checkPass) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: 'Old password does not match.',
                };
            }
            const password_hash = yield lib_1.default.hashValue(new_password);
            yield AgencyB2CUserModel.updateUser({ password_hash }, user_id, agency_id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.PASSWORD_CHANGED,
            };
        });
    }
}
exports.default = AgentB2CProfileService;
