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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const emailSendLib_1 = __importDefault(require("../../../utils/lib/emailSendLib"));
const registrationVerificationCompletedTemplate_1 = require("../../../utils/templates/registrationVerificationCompletedTemplate");
class AgentSubAgentService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createSubAgency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id, agency_id, agency_type } = req.agencyUser;
                if (agency_type === 'SUB AGENT') {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_FORBIDDEN,
                        message: 'No authority has been found to create a SUB AGENT',
                    };
                }
                const body = req.body;
                const { email, agency_name, user_name, address, phone, flight_markup_type, hotel_markup_type, flight_markup_mode, hotel_markup_mode, flight_markup, hotel_markup, } = body;
                const agencyModel = this.Model.AgencyModel(trx);
                const agencyUserModel = this.Model.AgencyUserModel(trx);
                const subAgentMarkupModel = this.Model.SubAgentMarkupModel(trx);
                const checkSubAgentName = yield agencyModel.checkAgency({
                    name: agency_name,
                    agency_type: constants_1.SOURCE_SUB_AGENT,
                    ref_agent_id: agency_id,
                });
                if (checkSubAgentName) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'Duplicate agency name! Agency already exists with this name.',
                    };
                }
                const checkAgentUser = yield agencyUserModel.checkUser({
                    email,
                    agency_type: constants_1.SOURCE_SUB_AGENT,
                    ref_agent_id: agency_id,
                });
                if (checkAgentUser) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'Email already exists. Please use another email',
                    };
                }
                let agency_logo = '';
                let civil_aviation = '';
                let trade_license = '';
                let national_id = '';
                const files = req.files || [];
                files.forEach((file) => {
                    switch (file.fieldname) {
                        case 'agency_logo':
                            agency_logo = file.filename;
                            break;
                        case 'civil_aviation':
                            civil_aviation = file.filename;
                            break;
                        case 'trade_license':
                            trade_license = file.filename;
                            break;
                        case 'national_id':
                            national_id = file.filename;
                            break;
                        default:
                            throw new customError_1.default('Invalid files. Please provide valid trade license, civil aviation, NID, logo', this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                });
                const sub_agent_no = yield lib_1.default.generateNo({
                    trx,
                    type: constants_1.GENERATE_AUTO_UNIQUE_ID.sub_agent,
                });
                const newSubAgency = yield agencyModel.createAgency({
                    address,
                    status: 'Active',
                    agent_no: sub_agent_no,
                    agency_name,
                    email,
                    phone,
                    agency_logo,
                    civil_aviation,
                    trade_license,
                    national_id,
                    ref_agent_id: agency_id,
                    created_by: user_id,
                    agency_type: constants_1.SOURCE_SUB_AGENT,
                });
                const newRole = yield agencyUserModel.createRole({
                    agency_id: newSubAgency[0].id,
                    name: 'Super Admin',
                    is_main_role: true,
                });
                let username = lib_1.default.generateUsername(user_name);
                let suffix = 1;
                while (yield agencyUserModel.checkUser({ username })) {
                    username = `${username}${suffix}`;
                    suffix += 1;
                }
                const password = lib_1.default.generateRandomPassword(8);
                const hashed_password = yield lib_1.default.hashValue(password);
                const newUser = yield agencyUserModel.createUser({
                    agency_id: newSubAgency[0].id,
                    email,
                    hashed_password,
                    is_main_user: true,
                    name: user_name,
                    phone_number: phone,
                    role_id: newRole[0].id,
                    username,
                });
                yield subAgentMarkupModel.createSubAgentMarkup({
                    agency_id: newSubAgency[0].id,
                    flight_markup_mode,
                    hotel_markup_mode,
                    flight_markup_type,
                    hotel_markup_type,
                    flight_markup,
                    hotel_markup,
                });
                yield emailSendLib_1.default.sendEmailAgent(trx, agency_id, {
                    email,
                    emailSub: `${agency_name} Agency Credentials`,
                    emailBody: (0, registrationVerificationCompletedTemplate_1.registrationVerificationCompletedTemplate)(agency_name, {
                        email: email,
                        password: password,
                    }),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'SUB AGENT has been created',
                    data: {
                        agency_id: newSubAgency[0].id,
                        user_id: newUser[0].id,
                        agency_logo,
                        civil_aviation,
                        trade_license,
                        national_id,
                    },
                };
            }));
        });
    }
    getAllSubAgency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const query = req.query;
            const AgencyModel = this.Model.AgencyModel();
            const data = yield AgencyModel.getAgencyList(Object.assign(Object.assign({}, query), { ref_agent_id: agency_id, agency_type: constants_1.SOURCE_SUB_AGENT }), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data.data,
                total: data.total,
            };
        });
    }
    getSingleSubAgency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const { id } = req.params;
                const AgencyModel = this.Model.AgencyModel(trx);
                const subAgentMarkupModel = this.Model.SubAgentMarkupModel(trx);
                const data = yield AgencyModel.getSingleAgency({
                    id: Number(id),
                    type: constants_1.SOURCE_SUB_AGENT,
                    ref_agent_id: agency_id,
                });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { flight_markup_set, hotel_markup_set, flight_markup_set_name, hotel_markup_set_name } = data, rest = __rest(data, ["flight_markup_set", "hotel_markup_set", "flight_markup_set_name", "hotel_markup_set_name"]);
                const markup_data = yield subAgentMarkupModel.getSubAgentMarkup(Number(id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: Object.assign(Object.assign({}, rest), { markup_data: markup_data
                            ? markup_data
                            : {
                                agency_id: id,
                                flight_markup_type: 'PER',
                                hotel_markup_type: 0,
                                flight_markup_mode: 'INCREASE',
                                hotel_markup_mode: 'INCREASE',
                                flight_markup: 0,
                                hotel_markup: 0,
                            } }),
                };
            }));
        });
    }
    updateAgency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const { id } = req.params;
                const AgentModel = this.Model.AgencyModel(trx);
                const agencyUserModel = this.Model.AgencyUserModel(trx);
                const checkAgency = yield AgentModel.checkAgency({
                    agency_id: Number(id),
                    ref_agent_id: agency_id,
                    agency_type: constants_1.SOURCE_SUB_AGENT,
                });
                if (!checkAgency) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                // if (
                //   checkAgency.status === 'Incomplete' ||
                //   checkAgency.status === 'Pending' ||
                //   checkAgency.status === 'Rejected'
                // ) {
                //   throw new CustomError(
                //     this.ResMsg.HTTP_NOT_FOUND,
                //     this.StatusCode.HTTP_NOT_FOUND
                //   );
                // }
                const _a = req.body, { flight_markup_type, hotel_markup_type, flight_markup_mode, hotel_markup_mode, flight_markup, hotel_markup } = _a, rest = __rest(_a, ["flight_markup_type", "hotel_markup_type", "flight_markup_mode", "hotel_markup_mode", "flight_markup", "hotel_markup"]);
                const files = req.files || [];
                const payload = rest;
                if (payload.agency_name) {
                    const checkSubAgentName = yield AgentModel.checkAgency({
                        name: payload.agency_name,
                    });
                    if (checkSubAgentName) {
                        throw new customError_1.default('Duplicate agency name! Agency already exists with this name', this.StatusCode.HTTP_CONFLICT);
                    }
                }
                if (payload.email) {
                    const checkAgentUser = yield agencyUserModel.checkUser({
                        email: payload.email,
                    });
                    if (checkAgentUser) {
                        throw new customError_1.default('Email already exists. Please use another email', this.StatusCode.HTTP_CONFLICT);
                    }
                }
                files.forEach((file) => {
                    switch (file.fieldname) {
                        case 'agency_logo':
                            payload.agency_logo = file.filename;
                            break;
                        case 'civil_aviation':
                            payload.civil_aviation = file.filename;
                            break;
                        case 'trade_license':
                            payload.trade_license = file.filename;
                            break;
                        case 'national_id':
                            payload.national_id = file.filename;
                            break;
                        default:
                            throw new customError_1.default('Invalid files. Please provide valid trade license, civil aviation, NID, logo.', this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                });
                const deleteFiles = [];
                if (payload.agency_logo && checkAgency.agency_logo) {
                    deleteFiles.push(checkAgency.agency_logo);
                }
                if (payload.civil_aviation && checkAgency.civil_aviation) {
                    deleteFiles.push(checkAgency.civil_aviation);
                }
                if (payload.national_id && checkAgency.national_id) {
                    deleteFiles.push(checkAgency.national_id);
                }
                if (payload.trade_license && checkAgency.trade_license) {
                    deleteFiles.push(checkAgency.trade_license);
                }
                if (Object.keys(payload).length) {
                    yield AgentModel.updateAgency(payload, Number(id));
                }
                if (deleteFiles.length) {
                    yield this.manageFile.deleteFromCloud(deleteFiles);
                }
                if (flight_markup ||
                    hotel_markup ||
                    flight_markup_mode ||
                    hotel_markup_mode ||
                    flight_markup_type ||
                    hotel_markup_type) {
                    const subAgentMarkupModel = this.Model.SubAgentMarkupModel(trx);
                    yield subAgentMarkupModel.updateSubAgentMarkup({
                        flight_markup_mode,
                        hotel_markup_mode,
                        flight_markup_type,
                        hotel_markup_type,
                        flight_markup,
                        hotel_markup,
                    }, Number(id));
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    getAllUsersOfAgency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const agencyUserModel = this.Model.AgencyUserModel();
            const query = req.query;
            const users = yield agencyUserModel.getUserList(Object.assign(Object.assign({}, query), { agency_id: Number(id) }), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: users.data,
                total: users.total,
            };
        });
    }
}
exports.default = AgentSubAgentService;
