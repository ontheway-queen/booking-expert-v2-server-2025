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
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const customError_1 = __importDefault(require("../../../../utils/lib/customError"));
const uuid_1 = require("uuid");
const lib_1 = __importDefault(require("../../../../utils/lib/lib"));
const config_1 = __importDefault(require("../../../../config/config"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
const emailSendLib_1 = __importDefault(require("../../../../utils/lib/emailSendLib"));
const registrationVerificationCompletedTemplate_1 = require("../../../../utils/templates/registrationVerificationCompletedTemplate");
class AdminAgentAgencyService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getAgency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const AgencyModel = this.Model.AgencyModel();
            const data = yield AgencyModel.getAgencyList(query, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data.data,
                total: data.total,
            };
        });
    }
    getSingleAgency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const agency_id = Number(id);
                const AgencyModel = this.Model.AgencyModel(trx);
                const AgencyUserModel = this.Model.AgencyUserModel(trx);
                const data = yield AgencyModel.getSingleAgency(agency_id);
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const users = yield AgencyUserModel.getUserList({ agency_id }, true);
                let whiteLabelPermissions = {
                    flight: false,
                    hotel: false,
                    visa: false,
                    holiday: false,
                    umrah: false,
                    group_fare: false,
                    blog: false,
                    token: '',
                };
                if (data.white_label) {
                    const wPermissions = yield AgencyModel.getWhiteLabelPermission({
                        agency_id,
                    });
                    if (wPermissions) {
                        whiteLabelPermissions = wPermissions;
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: Object.assign(Object.assign({}, data), { users: users.data, total_user: users.total, whiteLabelPermissions }),
                };
            }));
        });
    }
    updateAgencyUser(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.params;
                const AgencyUserModel = this.Model.AgencyUserModel(trx);
                const checkUser = yield AgencyUserModel.checkUser({
                    id: Number(user_id),
                    agency_id: Number(agency_id),
                });
                if (!checkUser) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                const body = req.body;
                const files = req.files || [];
                const payload = body;
                if (files.length) {
                    payload.photo = files[0].filename;
                }
                yield AgencyUserModel.updateUser(payload, {
                    agency_id: Number(agency_id),
                    id: Number(user_id),
                });
                if (checkUser.photo && payload.photo) {
                    yield this.manageFile.deleteFromCloud([checkUser.photo]);
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
    updateAgency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const agency_id = Number(id);
                const AgentModel = this.Model.AgencyModel(trx);
                const checkAgency = yield AgentModel.checkAgency({
                    agency_id,
                });
                if (!checkAgency) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                if (checkAgency.status === 'Incomplete' ||
                    checkAgency.status === 'Pending' ||
                    checkAgency.status === 'Rejected') {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                const { user_id } = req.admin;
                const _a = req.body, { white_label_permissions, kam_id, ref_id } = _a, restBody = __rest(_a, ["white_label_permissions", "kam_id", "ref_id"]);
                const files = req.files || [];
                const payload = Object.assign({}, restBody);
                if (kam_id) {
                    const adminModel = this.Model.AdminModel(trx);
                    const checkKam = yield adminModel.checkUserAdmin({ id: kam_id });
                    if (!checkKam) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Invalid KAM ID',
                        };
                    }
                    else {
                        payload.kam_id = kam_id;
                    }
                }
                if (ref_id) {
                    const adminModel = this.Model.AdminModel(trx);
                    const checkKam = yield adminModel.checkUserAdmin({ id: ref_id });
                    if (!checkKam) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Invalid KAM ID',
                        };
                    }
                    else {
                        payload.ref_id = ref_id;
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
                if (restBody.white_label && !white_label_permissions) {
                    const checkPermission = yield AgentModel.getWhiteLabelPermission({
                        agency_id,
                    });
                    if (!checkPermission) {
                        const uuid = (0, uuid_1.v4)();
                        yield AgentModel.createWhiteLabelPermission({
                            agency_id,
                            token: uuid,
                            blog: false,
                            flight: false,
                            group_fare: false,
                            holiday: false,
                            hotel: false,
                            umrah: false,
                            visa: false,
                        });
                    }
                }
                if (white_label_permissions) {
                    const checkPermission = yield AgentModel.getWhiteLabelPermission({
                        agency_id,
                    });
                    if (checkPermission && white_label_permissions) {
                        yield AgentModel.updateWhiteLabelPermission(white_label_permissions, agency_id);
                    }
                    else {
                        const uuid = (0, uuid_1.v4)();
                        yield AgentModel.createWhiteLabelPermission(Object.assign({ agency_id, token: uuid }, white_label_permissions));
                    }
                }
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
                    yield AgentModel.updateAgency(payload, agency_id);
                }
                if (deleteFiles.length) {
                    yield this.manageFile.deleteFromCloud(deleteFiles);
                }
                yield this.insertAdminAudit(trx, {
                    created_by: user_id,
                    type: 'UPDATE',
                    details: `Agency Updated - ${checkAgency.agency_name}(${checkAgency.agent_no})`,
                    payload,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    updateAgencyApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const agency_id = Number(id);
                const AgentModel = this.Model.AgencyModel(trx);
                const MarkupSetModel = this.Model.DynamicFareSetModel(trx);
                const checkAgency = yield AgentModel.checkAgency({
                    agency_id,
                });
                if (!checkAgency) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                if (checkAgency.status === 'Active' ||
                    checkAgency.status === 'Inactive') {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                const body = req.body;
                let payload = {};
                if (body.status === 'Active') {
                    if (!body.hotel_markup_set || !body.flight_markup_set || !body.kam_id) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                            message: 'Flight, hotel markup sets and kam_id are required for activation.',
                        };
                    }
                    const checkFlightMarkupSet = yield MarkupSetModel.checkDynamicFareSet({
                        id: body.flight_markup_set,
                        status: true,
                        type: constants_1.TYPE_FLIGHT,
                    });
                    if (!checkFlightMarkupSet) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                            message: 'Invalid flight markup set.',
                        };
                    }
                    const checkHotelMarkupSet = yield MarkupSetModel.getSingleDynamicFareSet({
                        id: body.hotel_markup_set,
                        status: true,
                        type: constants_1.TYPE_HOTEL,
                    });
                    if (!checkHotelMarkupSet) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                            message: 'Invalid hotel markup set.',
                        };
                    }
                    payload.status = body.status;
                    payload.flight_markup_set = body.flight_markup_set;
                    payload.hotel_markup_set = body.hotel_markup_set;
                    payload.kam_id = body.kam_id;
                    payload.book_permission = body.book_permission;
                }
                else {
                    payload.status = body.status;
                }
                yield AgentModel.updateAgency(payload, agency_id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    agencyLogin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const { id: a_id } = req.params;
                const agency_id = Number(a_id);
                const AgentUserModel = this.Model.AgencyUserModel(trx);
                const checkUserAgency = yield AgentUserModel.checkUser({
                    agency_id,
                    is_main_user: true,
                });
                if (!checkUserAgency) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { status, email, id, username, name, photo, agency_status, phone_number, agency_email, agency_name, is_main_user, agency_type, ref_agent_id, agency_logo, address, } = checkUserAgency;
                if (agency_status === 'Inactive' ||
                    agency_status === 'Incomplete' ||
                    agency_status === 'Rejected') {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Unauthorized agency! Please contact with us.',
                    };
                }
                if (!status) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_ACCOUNT_INACTIVE,
                    };
                }
                const tokenData = {
                    user_id: id,
                    username,
                    user_email: email,
                    name,
                    agency_id,
                    agency_email,
                    agency_name,
                    is_main_user,
                    phone_number,
                    photo,
                    agency_type,
                    ref_agent_id,
                    address,
                    agency_logo,
                };
                const token = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_AGENT, '24h');
                yield this.insertAdminAudit(trx, {
                    created_by: user_id,
                    details: `Direct login to agent panel - ${checkUserAgency.agency_name}(${checkUserAgency.agent_no}) with ${checkUserAgency.username}`,
                    type: 'GET',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.LOGIN_SUCCESSFUL,
                    data: {
                        token,
                    },
                };
            }));
        });
    }
    createAgency(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const body = req.body;
                const { white_label_permissions, user_name, ref_id } = body, rest = __rest(body, ["white_label_permissions", "user_name", "ref_id"]);
                const agencyModel = this.Model.AgencyModel(trx);
                const agencyUserModel = this.Model.AgencyUserModel(trx);
                const adminModel = this.Model.AdminModel(trx);
                const checkSubAgentName = yield agencyModel.checkAgency({
                    name: body.agency_name,
                });
                if (checkSubAgentName) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'Duplicate agency name! Agency already exists with this name',
                    };
                }
                const checkAgentUser = yield agencyUserModel.checkUser({
                    email: body.email,
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
                const agent_no = yield lib_1.default.generateNo({
                    trx,
                    type: constants_1.GENERATE_AUTO_UNIQUE_ID.agent,
                });
                const checkKam = yield adminModel.checkUserAdmin({ id: body.kam_id });
                if (!checkKam) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Invalid KAM ID',
                    };
                }
                if (ref_id) {
                    const checkRef = yield adminModel.checkUserAdmin({ id: ref_id });
                    if (!checkRef) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Invalid Ref id',
                        };
                    }
                }
                const newAgency = yield agencyModel.createAgency(Object.assign(Object.assign({ status: 'Active', agent_no: agent_no, agency_logo,
                    civil_aviation,
                    trade_license,
                    national_id, created_by: user_id }, rest), { agency_type: 'Agent', ref_id }));
                const newRole = yield agencyUserModel.createRole({
                    agency_id: newAgency[0].id,
                    name: 'Super Admin',
                    is_main_role: true,
                });
                const rolePermissionsPayload = [];
                const permissions = yield agencyUserModel.getAllPermissions();
                permissions.forEach((permission) => {
                    rolePermissionsPayload.push({
                        role_id: newRole[0].id,
                        permission_id: permission.id,
                        agency_id: newAgency[0].id,
                        delete: true,
                        write: true,
                        read: true,
                        update: true,
                    });
                });
                yield agencyUserModel.insertRolePermission(rolePermissionsPayload);
                let username = lib_1.default.generateUsername(body.user_name);
                let suffix = 1;
                while (yield agencyUserModel.checkUser({ username })) {
                    username = `${username}${suffix}`;
                    suffix += 1;
                }
                const password = lib_1.default.generateRandomPassword(12);
                const hashed_password = yield lib_1.default.hashValue(password);
                const newUser = yield agencyUserModel.createUser({
                    agency_id: newAgency[0].id,
                    email: body.email,
                    hashed_password,
                    is_main_user: true,
                    name: body.user_name,
                    phone_number: body.phone,
                    role_id: newRole[0].id,
                    username,
                });
                if (body.white_label && white_label_permissions) {
                    const uuid = (0, uuid_1.v4)();
                    yield agencyModel.createWhiteLabelPermission(Object.assign(Object.assign({ agency_id: newAgency[0].id }, white_label_permissions), { token: uuid }));
                    if (white_label_permissions.flight || white_label_permissions.hotel) {
                        yield agencyModel.createAgentB2CMarkup({
                            agency_id: newAgency[0].id,
                            flight_markup: 200,
                            flight_markup_mode: 'INCREASE',
                            flight_markup_type: 'FLAT',
                            hotel_markup: 200,
                            hotel_markup_mode: 'INCREASE',
                            hotel_markup_type: 'FLAT',
                        });
                    }
                }
                yield emailSendLib_1.default.sendEmail({
                    email: `${body.email}, ${constants_1.ADMIN_NOTIFY_EMAIL}`,
                    emailSub: `Booking Expert Agency Credentials`,
                    emailBody: (0, registrationVerificationCompletedTemplate_1.registrationVerificationCompletedTemplate)(body.agency_name, {
                        email: body.email,
                        password: password,
                    }),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Agent has been created',
                    data: {
                        agency_id: newAgency[0].id,
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
}
exports.default = AdminAgentAgencyService;
