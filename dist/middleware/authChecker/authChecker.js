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
const statusCode_1 = __importDefault(require("../../utils/miscellaneous/statusCode"));
const responseMessage_1 = __importDefault(require("../../utils/miscellaneous/responseMessage"));
const lib_1 = __importDefault(require("../../utils/lib/lib"));
const config_1 = __importDefault(require("../../config/config"));
const adminModel_1 = __importDefault(require("../../models/adminModel/adminModel"));
const database_1 = require("../../app/database");
const agencyUserModel_1 = __importDefault(require("../../models/agentModel/agencyUserModel"));
const b2cUserModel_1 = __importDefault(require("../../models/b2cModel/b2cUserModel"));
const agencyModel_1 = __importDefault(require("../../models/agentModel/agencyModel"));
const agencyB2CUserModel_1 = __importDefault(require("../../models/agencyB2CModel/agencyB2CUserModel"));
class AuthChecker {
    constructor() {
        // admin auth checker
        this.adminAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                return;
            }
            const authSplit = authorization.split(' ');
            if (authSplit.length !== 2) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_ADMIN);
            if (!verify) {
                res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                return;
            }
            else {
                const { user_id } = verify;
                const adminModel = new adminModel_1.default(database_1.db);
                const checkAdmin = yield adminModel.checkUserAdmin({ id: user_id });
                if (checkAdmin) {
                    if (!checkAdmin.status) {
                        res
                            .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                            .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                    }
                    req.admin = {
                        is_main_user: checkAdmin.is_main_user,
                        name: checkAdmin.name,
                        photo: checkAdmin.photo,
                        user_email: checkAdmin.email,
                        user_id,
                        username: checkAdmin.username,
                        phone_number: checkAdmin.phone_number,
                    };
                    next();
                }
                else {
                    res
                        .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                        .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                }
            }
        });
        //B2C user auth checker
        this.b2cUserAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                return;
            }
            const authSplit = authorization.split(' ');
            if (authSplit.length !== 2) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_USER);
            if (!verify) {
                res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                return;
            }
            else {
                const { user_id } = verify;
                const userModel = new b2cUserModel_1.default(database_1.db);
                const user = yield userModel.checkUser({ id: user_id });
                if (user) {
                    if (!user.status) {
                        res
                            .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                            .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                    }
                    req.user = {
                        name: user === null || user === void 0 ? void 0 : user.name,
                        phone_number: user === null || user === void 0 ? void 0 : user.phone_number,
                        photo: user === null || user === void 0 ? void 0 : user.photo,
                        user_email: user === null || user === void 0 ? void 0 : user.email,
                        user_id,
                        username: user === null || user === void 0 ? void 0 : user.username,
                    };
                    next();
                }
                else {
                    res
                        .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                        .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                }
            }
        });
        // agency user auth checker
        this.agencyUserAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            let { authorization } = req.headers;
            if (!authorization)
                authorization = req.query.auth_token;
            console.log({ authorization });
            if (!authorization) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    statusCode: statusCode_1.default.HTTP_UNAUTHORIZED,
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const authSplit = authorization.split(' ');
            if (authSplit.length !== 2) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    statusCode: statusCode_1.default.HTTP_UNAUTHORIZED,
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_AGENT);
            console.log(verify);
            if (!verify) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    statusCode: statusCode_1.default.HTTP_UNAUTHORIZED,
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            else {
                const { user_id } = verify;
                const agencyUserModel = new agencyUserModel_1.default(database_1.db);
                const checkAgencyUser = yield agencyUserModel.checkUser({ id: user_id });
                if (checkAgencyUser) {
                    console.log({
                        type: 'Agent',
                        agency_id: checkAgencyUser.agency_id,
                        user_id: checkAgencyUser.id,
                        agency_name: checkAgencyUser.agency_name,
                    });
                    if (!checkAgencyUser.status) {
                        res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                            statusCode: statusCode_1.default.HTTP_UNAUTHORIZED,
                            success: false,
                            message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                        });
                        return;
                    }
                    if (checkAgencyUser.agency_status === 'Inactive' ||
                        checkAgencyUser.agency_status === 'Incomplete' ||
                        checkAgencyUser.agency_status === 'Rejected') {
                        res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                            statusCode: statusCode_1.default.HTTP_UNAUTHORIZED,
                            success: false,
                            message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                        });
                        return;
                    }
                    else {
                        req.agencyUser = {
                            agency_email: checkAgencyUser.agency_email,
                            agency_id: checkAgencyUser.agency_id,
                            agency_name: checkAgencyUser.agency_name,
                            is_main_user: checkAgencyUser.is_main_user,
                            name: checkAgencyUser.name,
                            photo: checkAgencyUser.photo,
                            user_email: checkAgencyUser.email,
                            user_id,
                            username: checkAgencyUser.username,
                            phone_number: checkAgencyUser.phone_number,
                            ref_agent_id: checkAgencyUser.ref_agent_id,
                            agency_type: checkAgencyUser.agency_type,
                            address: checkAgencyUser.address,
                            agency_logo: checkAgencyUser.agency_logo,
                        };
                        next();
                    }
                }
                else {
                    res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                        statusCode: statusCode_1.default.HTTP_UNAUTHORIZED,
                        success: false,
                        message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                    });
                    return;
                }
            }
        });
        // sub agent user auth checker
        this.subAgentUserAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            let { authorization } = req.headers;
            if (!authorization)
                authorization = req.query.auth_token;
            if (!authorization) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    statusCode: statusCode_1.default.HTTP_UNAUTHORIZED,
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const authSplit = authorization.split(' ');
            if (authSplit.length !== 2) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    statusCode: statusCode_1.default.HTTP_UNAUTHORIZED,
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_AGENT + req.agencyB2CWhiteLabel.agency_id);
            console.log(verify);
            if (!verify) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    statusCode: statusCode_1.default.HTTP_UNAUTHORIZED,
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            else {
                const { user_id } = verify;
                const agencyUserModel = new agencyUserModel_1.default(database_1.db);
                const checkAgencyUser = yield agencyUserModel.checkUser({ id: user_id });
                if (checkAgencyUser) {
                    console.log({
                        type: 'Agent',
                        agency_id: checkAgencyUser.agency_id,
                        user_id: checkAgencyUser.id,
                        agency_name: checkAgencyUser.agency_name,
                    });
                    if (!checkAgencyUser.status) {
                        res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                            statusCode: statusCode_1.default.HTTP_UNAUTHORIZED,
                            success: false,
                            message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                        });
                        return;
                    }
                    if (checkAgencyUser.agency_status === 'Inactive' ||
                        checkAgencyUser.agency_status === 'Incomplete' ||
                        checkAgencyUser.agency_status === 'Rejected') {
                        res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                            statusCode: statusCode_1.default.HTTP_UNAUTHORIZED,
                            success: false,
                            message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                        });
                        return;
                    }
                    else {
                        req.agencyUser = {
                            agency_email: checkAgencyUser.agency_email,
                            agency_id: checkAgencyUser.agency_id,
                            agency_name: checkAgencyUser.agency_name,
                            is_main_user: checkAgencyUser.is_main_user,
                            name: checkAgencyUser.name,
                            photo: checkAgencyUser.photo,
                            user_email: checkAgencyUser.email,
                            user_id,
                            username: checkAgencyUser.username,
                            phone_number: checkAgencyUser.phone_number,
                            ref_agent_id: checkAgencyUser.ref_agent_id,
                            agency_type: checkAgencyUser.agency_type,
                            address: checkAgencyUser.address,
                            agency_logo: checkAgencyUser.agency_logo,
                        };
                        next();
                    }
                }
                else {
                    res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                        statusCode: statusCode_1.default.HTTP_UNAUTHORIZED,
                        success: false,
                        message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                    });
                    return;
                }
            }
        });
        //Agency B2C user auth checker
        this.agencyB2CUserAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                return;
            }
            const authSplit = authorization.split(' ');
            if (authSplit.length !== 2) {
                res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
                return;
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_AGENT_B2C);
            if (!verify) {
                res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                return;
            }
            else {
                const { agency_id, user_email, user_id } = verify;
                const agencyModel = new agencyModel_1.default(database_1.db);
                const agentB2CUserModel = new agencyB2CUserModel_1.default(database_1.db);
                const check_agency = yield agencyModel.checkAgency({
                    agency_id,
                });
                if (!check_agency || check_agency.status !== 'Active') {
                    res
                        .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                        .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                    return;
                }
                const check_agent_b2c = yield agentB2CUserModel.checkUser({
                    email: user_email,
                    agency_id,
                });
                if (!check_agent_b2c || check_agent_b2c.status === false) {
                    res
                        .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                        .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                    return;
                }
                req.agencyB2CUser = {
                    agency_id,
                    agency_name: String(check_agency === null || check_agency === void 0 ? void 0 : check_agency.agency_name),
                    agency_email: String(check_agency === null || check_agency === void 0 ? void 0 : check_agency.email),
                    agency_logo: String(check_agency === null || check_agency === void 0 ? void 0 : check_agency.agency_logo),
                    agency_address: String(check_agency === null || check_agency === void 0 ? void 0 : check_agency.address),
                    agency_number: String(check_agency === null || check_agency === void 0 ? void 0 : check_agency.phone),
                    user_id: user_id,
                    photo: String(check_agent_b2c === null || check_agent_b2c === void 0 ? void 0 : check_agent_b2c.photo),
                    user_email: String(user_email),
                    username: String(check_agent_b2c === null || check_agent_b2c === void 0 ? void 0 : check_agent_b2c.username),
                    name: String(check_agent_b2c === null || check_agent_b2c === void 0 ? void 0 : check_agent_b2c.name),
                    phone_number: String(check_agent_b2c === null || check_agent_b2c === void 0 ? void 0 : check_agent_b2c.phone_number),
                };
                next();
            }
        });
        // Agency White label Auth Checker
        this.whiteLabelAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            let { token } = req.headers;
            if (!token) {
                token = req.query.token;
            }
            if (!token) {
                res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                return;
            }
            else {
                const agencyModel = new agencyModel_1.default(database_1.db);
                const check_token = yield agencyModel.getWhiteLabelPermission({
                    token: token,
                });
                if (!check_token) {
                    res
                        .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                        .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                    return;
                }
                const check_agency = yield agencyModel.checkAgency({
                    agency_id: check_token === null || check_token === void 0 ? void 0 : check_token.agency_id,
                });
                if (!check_agency ||
                    check_agency.status !== 'Active' ||
                    !check_agency.white_label) {
                    res
                        .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                        .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
                    return;
                }
                const module = req.originalUrl.split('/')[4] || '';
                req.agencyB2CWhiteLabel = {
                    agency_id: check_token.agency_id,
                    agency_name: check_agency.agency_name,
                    flight: Boolean(check_token === null || check_token === void 0 ? void 0 : check_token.flight),
                    hotel: Boolean(check_token === null || check_token === void 0 ? void 0 : check_token.hotel),
                    visa: Boolean(check_token === null || check_token === void 0 ? void 0 : check_token.visa),
                    holiday: Boolean(check_token === null || check_token === void 0 ? void 0 : check_token.holiday),
                    umrah: Boolean(check_token === null || check_token === void 0 ? void 0 : check_token.umrah),
                    group_fare: Boolean(check_token === null || check_token === void 0 ? void 0 : check_token.group_fare),
                    blog: Boolean(check_token === null || check_token === void 0 ? void 0 : check_token.blog),
                    agency_logo: check_agency.agency_logo,
                };
                // Check permission
                const agencyB2CModules = [
                    'flight',
                    'hotel',
                    'visa',
                    'holiday',
                    'umrah',
                    'group_fare',
                    'blog',
                    'agent-b2c',
                    'profile',
                    'email-otp',
                    'traveler',
                    'config',
                ];
                console.log({
                    type: 'White label',
                    agency_id: check_agency.id,
                    agency_name: check_agency.agency_name,
                    module,
                });
                let hasPermission = agencyB2CModules.includes(module);
                // if (!hasPermission) {
                //   res
                //     .status(StatusCode.HTTP_UNAUTHORIZED)
                //     .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
                //   return;
                // }
                next();
            }
        });
        // Agency B2C API Authorizer
        this.agencyB2CAPIAccessChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            req.agentAPI = { agency_email: '', agency_id: 1, agency_name: '' };
            next();
        });
        // External API Authorizer
        this.externalAPIAccessChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            req.external = { external_email: '', external_id: 1, external_name: '' };
            next();
        });
    }
}
exports.default = AuthChecker;
