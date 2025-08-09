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
exports.AgentB2CSubSiteConfigController = void 0;
const abstract_controller_1 = __importDefault(require("../../../../abstract/abstract.controller"));
const agentB2CSubSiteConfig_service_1 = require("../../services/agentB2CServices/agentB2CSubSiteConfig.service");
const agentB2CSubSiteConfig_validator_1 = require("../../utils/validators/agentB2CValidators/agentB2CSubSiteConfig.validator");
class AgentB2CSubSiteConfigController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new agentB2CSubSiteConfig_service_1.AgentB2CSubSiteConfigService();
        this.validator = new agentB2CSubSiteConfig_validator_1.AgentB2CSubSiteConfigValidator();
        this.updateSiteConfig = this.asyncWrapper.wrap({ bodySchema: this.validator.updateSiteConfig }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateSiteConfig(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getSiteConfigData = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSiteConfigData(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getAboutUsData = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAboutUsData(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.updateAboutUsData = this.asyncWrapper.wrap({ bodySchema: this.validator.updateAboutUs }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateAboutUsData(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getContactUsData = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getContactUsData(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.updateContactUsData = this.asyncWrapper.wrap({ bodySchema: this.validator.updateContactUs }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateContactUsData(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getPrivacyPolicyData = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getPrivacyPolicyData(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.updatePrivacyPolicyData = this.asyncWrapper.wrap({ bodySchema: this.validator.updatePrivacyPolicy }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updatePrivacyPolicyData(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getTermsAndConditionsData = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getTermsAndConditionsData(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.updateTermsAndConditions = this.asyncWrapper.wrap({ bodySchema: this.validator.updateTermsAndConditions }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateTermsAndConditions(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getSocialLinks = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSocialLinks(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.deleteSocialLinks = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamNumValidator() }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteSocialLinks(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.createSocialLinks = this.asyncWrapper.wrap({ bodySchema: this.validator.createSocialLinks }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createSocialLinks(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.updateSocialLinks = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamNumValidator(),
            bodySchema: this.validator.updateSocialLinks,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateSocialLinks(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
        this.getPopUpBanner = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getPopUpBanner(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.upSertPopUpBanner = this.asyncWrapper.wrap({
            bodySchema: this.validator.upSertPopUpBanner,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.upSertPopUpBanner(req), { code } = _a, data = __rest(_a, ["code"]);
            if (data.success) {
                res.status(code).json(data);
            }
            else {
                this.error(data.message, code);
            }
        }));
    }
}
exports.AgentB2CSubSiteConfigController = AgentB2CSubSiteConfigController;
