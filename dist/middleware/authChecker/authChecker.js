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
class AuthChecker {
    constructor() {
        // admin auth checker
        this.adminAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            const authSplit = authorization.split(' ');
            if (authSplit.length !== 2) {
                return res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_ADMIN);
            if (!verify) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            else {
                req.admin = verify;
                next();
            }
        });
        //B2C user auth checker
        this.b2cUserAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            const authSplit = authorization.split(' ');
            if (authSplit.length !== 2) {
                return res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_USER);
            if (!verify) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            else {
                req.user = verify;
                console.log({ user: req.user });
                next();
            }
        });
        // agency user auth checker
        this.agencyUserAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            const authSplit = authorization.split(' ');
            if (authSplit.length !== 2) {
                return res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_AGENT);
            if (!verify) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            else {
                req.agencyUser = verify;
                next();
            }
        });
        //Agency B2C user auth checker
        this.AgencyB2CUserAuthChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { authorization } = req.headers;
            if (!authorization) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            const authSplit = authorization.split(' ');
            if (authSplit.length !== 2) {
                return res.status(statusCode_1.default.HTTP_UNAUTHORIZED).json({
                    success: false,
                    message: responseMessage_1.default.HTTP_UNAUTHORIZED,
                });
            }
            const verify = lib_1.default.verifyToken(authSplit[1], config_1.default.JWT_SECRET_USER);
            if (!verify) {
                return res
                    .status(statusCode_1.default.HTTP_UNAUTHORIZED)
                    .json({ success: false, message: responseMessage_1.default.HTTP_UNAUTHORIZED });
            }
            else {
                req.agencyB2CUser = verify;
                console.log({ user: req.user });
                next();
            }
        });
        // Agency B2C API Authorizer
        this.AgencyB2CAPIAccessChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            req.agent = { agency_email: '', agency_id: 1, agency_name: '' };
            next();
        });
        // External API Authorizer
        this.ExternalAPIAccessChecker = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            req.external = { external_email: '', external_id: 1, external_name: '' };
            next();
        });
    }
}
exports.default = AuthChecker;
