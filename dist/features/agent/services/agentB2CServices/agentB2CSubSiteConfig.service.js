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
exports.AgentB2CSubSiteConfigService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
class AgentB2CSubSiteConfigService extends abstract_service_1.default {
    constructor() {
        super();
    }
    updateSiteConfig(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const _a = req.body, { emails, numbers, addresses } = _a, body = __rest(_a, ["emails", "numbers", "addresses"]);
                const files = req.files || [];
                const { agency_id, user_id } = req.agencyUser;
                const AgencyB2CConfigModel = this.Model.AgencyB2CConfigModel(trx);
                const checkConfig = yield AgencyB2CConfigModel.getSiteConfig({
                    agency_id,
                });
                const payload = Object.assign({ last_updated: new Date(), updated_by: user_id }, body);
                files.forEach((file) => {
                    if (file.fieldname === 'main_logo') {
                        payload.main_logo = file.filename;
                    }
                    if (file.fieldname === 'site_thumbnail') {
                        payload.site_thumbnail = file.filename;
                    }
                    if (file.fieldname === 'fabicon') {
                        payload.fabicon = file.filename;
                    }
                });
                if (emails) {
                    payload.emails = JSON.stringify(emails.emails);
                }
                if (numbers) {
                    payload.numbers = JSON.stringify(numbers.numbers);
                }
                if (addresses) {
                    console.log(addresses);
                    payload.address = JSON.stringify(addresses.addresses);
                }
                yield AgencyB2CConfigModel.updateConfig(payload, { agency_id });
                const deletedFiles = [];
                if ((checkConfig === null || checkConfig === void 0 ? void 0 : checkConfig.main_logo) && payload.main_logo) {
                    deletedFiles.push(checkConfig.main_logo);
                }
                if ((checkConfig === null || checkConfig === void 0 ? void 0 : checkConfig.fabicon) && payload.fabicon) {
                    deletedFiles.push(checkConfig.fabicon);
                }
                if ((checkConfig === null || checkConfig === void 0 ? void 0 : checkConfig.site_thumbnail) && payload.site_thumbnail) {
                    deletedFiles.push(checkConfig.site_thumbnail);
                }
                if (deletedFiles.length) {
                    yield this.manageFile.deleteFromCloud(deletedFiles);
                }
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: 'Updated site config data.',
                    payload: JSON.stringify(payload),
                    type: 'UPDATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        main_logo: payload.main_logo,
                        fabicon: payload.fabicon,
                        site_thumbnail: payload.site_thumbnail,
                    },
                };
            }));
        });
    }
    getSiteConfigData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const configModel = this.Model.AgencyB2CConfigModel();
            const siteConfig = yield configModel.getSiteConfig({ agency_id });
            if (!siteConfig) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const { agency_id: no_need_agency_id, id, about_us_content, contact_us_content, about_us_thumbnail, contact_us_thumbnail, privacy_policy_content, updated_by, updated_by_name, terms_and_conditions_content, last_updated } = siteConfig, restData = __rest(siteConfig, ["agency_id", "id", "about_us_content", "contact_us_content", "about_us_thumbnail", "contact_us_thumbnail", "privacy_policy_content", "updated_by", "updated_by_name", "terms_and_conditions_content", "last_updated"]);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: restData,
            };
        });
    }
    updateAboutUsData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const files = req.files || [];
            const { agency_id, user_id } = req.agencyUser;
            const AgencyB2CConfigModel = this.Model.AgencyB2CConfigModel();
            const checkConfig = yield AgencyB2CConfigModel.getSiteConfig({
                agency_id,
            });
            const payload = {
                last_updated: new Date(),
                updated_by: user_id,
            };
            if (body.content) {
                payload.about_us_content = body.content;
            }
            files.forEach((file) => {
                if (file.fieldname === 'thumbnail') {
                    payload.about_us_thumbnail = file.filename;
                }
            });
            yield AgencyB2CConfigModel.updateConfig(payload, { agency_id });
            if (payload.about_us_thumbnail && (checkConfig === null || checkConfig === void 0 ? void 0 : checkConfig.about_us_thumbnail)) {
                yield this.manageFile.deleteFromCloud([checkConfig.about_us_thumbnail]);
            }
            yield this.insertAgentAudit(undefined, {
                agency_id,
                created_by: user_id,
                details: 'Updated site config about us data.',
                payload: JSON.stringify(payload),
                type: 'UPDATE',
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: {
                    about_us_thumbnail: payload.about_us_thumbnail,
                },
            };
        });
    }
    getAboutUsData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const siteConfig = yield configModel.getSiteConfig({ agency_id });
                if (!siteConfig) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { about_us_content, about_us_thumbnail } = siteConfig;
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        about_us_content,
                        about_us_thumbnail,
                    },
                };
            }));
        });
    }
    updateContactUsData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const files = req.files || [];
            const { agency_id, user_id } = req.agencyUser;
            const AgencyB2CConfigModel = this.Model.AgencyB2CConfigModel();
            const checkConfig = yield AgencyB2CConfigModel.getSiteConfig({
                agency_id,
            });
            const payload = {
                last_updated: new Date(),
                updated_by: user_id,
            };
            if (body.content) {
                payload.contact_us_content = body.content;
            }
            files.forEach((file) => {
                if (file.fieldname === 'thumbnail') {
                    payload.contact_us_thumbnail = file.filename;
                }
            });
            yield AgencyB2CConfigModel.updateConfig(payload, { agency_id });
            if (payload.contact_us_content && (checkConfig === null || checkConfig === void 0 ? void 0 : checkConfig.contact_us_content)) {
                yield this.manageFile.deleteFromCloud([checkConfig.contact_us_content]);
            }
            yield this.insertAgentAudit(undefined, {
                agency_id,
                created_by: user_id,
                details: 'Updated site config contact us data.',
                payload: JSON.stringify(payload),
                type: 'UPDATE',
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: {
                    about_us_thumbnail: payload.contact_us_content,
                },
            };
        });
    }
    getContactUsData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const siteConfig = yield configModel.getSiteConfig({ agency_id });
                if (!siteConfig) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { contact_us_content, contact_us_thumbnail } = siteConfig;
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        contact_us_content,
                        contact_us_thumbnail,
                    },
                };
            }));
        });
    }
    updatePrivacyPolicyData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const { agency_id, user_id } = req.agencyUser;
            const AgencyB2CConfigModel = this.Model.AgencyB2CConfigModel();
            const payload = {
                last_updated: new Date(),
                updated_by: user_id,
            };
            if (body.content) {
                payload.privacy_policy_content = body.content;
            }
            yield AgencyB2CConfigModel.updateConfig(payload, { agency_id });
            yield this.insertAgentAudit(undefined, {
                agency_id,
                created_by: user_id,
                details: 'Updated site config privacy policy data.',
                payload: JSON.stringify(payload),
                type: 'UPDATE',
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    getPrivacyPolicyData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const siteConfig = yield configModel.getSiteConfig({ agency_id });
                if (!siteConfig) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { privacy_policy_content } = siteConfig;
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        privacy_policy_content,
                    },
                };
            }));
        });
    }
    updateTermsAndConditions(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const { agency_id, user_id } = req.agencyUser;
            const AgencyB2CConfigModel = this.Model.AgencyB2CConfigModel();
            const payload = {
                last_updated: new Date(),
                updated_by: user_id,
            };
            if (body.content) {
                payload.about_us_content = body.content;
            }
            yield AgencyB2CConfigModel.updateConfig(payload, { agency_id });
            yield this.insertAgentAudit(undefined, {
                agency_id,
                created_by: user_id,
                details: 'Updated site config terms and conditions data.',
                payload: JSON.stringify(payload),
                type: 'UPDATE',
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: {
                    about_us_thumbnail: payload.about_us_thumbnail,
                },
            };
        });
    }
    getTermsAndConditionsData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const configModel = this.Model.AgencyB2CConfigModel();
            const siteConfig = yield configModel.getSiteConfig({ agency_id });
            if (!siteConfig) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const { terms_and_conditions_content } = siteConfig;
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: {
                    terms_and_conditions_content,
                },
            };
        });
    }
    getSocialLinks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const configModel = this.Model.AgencyB2CConfigModel();
            const { agency_id } = req.agencyUser;
            const social_links = yield configModel.getSocialLink({
                agency_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: social_links,
            };
        });
    }
    deleteSocialLinks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const { agency_id, user_id } = req.agencyUser;
                const id = Number(req.params.id);
                const check = yield configModel.checkSocialLink({ agency_id, id });
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield configModel.deleteSocialLink({ agency_id, id });
                if (check.icon) {
                    yield this.manageFile.deleteFromCloud([check.icon]);
                }
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `Deleted social media link [${check.media}(${check.link})]`,
                    type: 'DELETE',
                });
                if (check.icon) {
                    yield this.manageFile.deleteFromCloud([check.icon]);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    createSocialLinks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const { agency_id, user_id } = req.agencyUser;
                const body = req.body;
                const files = req.files || [];
                const lastNo = yield configModel.getSocialLinkLastNo({ agency_id });
                const payload = Object.assign({ agency_id, order_number: (lastNo === null || lastNo === void 0 ? void 0 : lastNo.order_number) ? lastNo.order_number + 1 : 1 }, body);
                if (files.length) {
                    payload.icon = files[0].filename;
                }
                yield configModel.insertSocialLink(payload);
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `Created new social link.`,
                    payload: JSON.stringify(payload),
                    type: 'CREATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        icon: payload.icon,
                    },
                };
            }));
        });
    }
    updateSocialLinks(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const { agency_id, user_id } = req.agencyUser;
                const id = Number(req.params.id);
                const check = yield configModel.checkSocialLink({ agency_id, id });
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const body = req.body;
                const files = req.files || [];
                const payload = body;
                if (files.length) {
                    payload.icon = files[0].filename;
                }
                yield configModel.updateSocialLink(payload, { agency_id, id });
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: `Updated Social link(${id}).`,
                    payload: JSON.stringify(payload),
                    type: 'UPDATE',
                });
                if (payload.icon && check.icon) {
                    yield this.manageFile.deleteFromCloud([check.icon]);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        icon: payload.icon,
                    },
                };
            }));
        });
    }
    getPopUpBanner(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const configModel = this.Model.AgencyB2CConfigModel();
            const { agency_id } = req.agencyUser;
            const popUpBanners = yield configModel.getPopUpBanner({ agency_id });
            const b2cPopUp = popUpBanners.find((banner) => banner.pop_up_for === 'B2C');
            const agentPopUp = popUpBanners.find((banner) => banner.pop_up_for === 'AGENT');
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: {
                    b2b: agentPopUp,
                    b2c: b2cPopUp,
                },
            };
        });
    }
    upSertPopUpBanner(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const { agency_id, user_id } = req.agencyUser;
                const _a = req.body, { pop_up_for } = _a, restBody = __rest(_a, ["pop_up_for"]);
                const files = req.files || [];
                const payload = restBody;
                if (files.length) {
                    payload.thumbnail = files[0].filename;
                }
                const checkPopUp = yield configModel.getPopUpBanner({
                    agency_id,
                    pop_up_for: pop_up_for,
                });
                let auditDesc = '';
                if (checkPopUp.length) {
                    yield configModel.updatePopUpBanner(payload, { agency_id, pop_up_for });
                    auditDesc = 'Created new pop up banner for ' + pop_up_for;
                }
                else {
                    yield configModel.insertPopUpBanner(Object.assign(Object.assign({}, payload), { pop_up_for,
                        agency_id }));
                    auditDesc = 'Updated ' + pop_up_for + ' Pop up banner.';
                }
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: auditDesc,
                    payload: JSON.stringify(payload),
                    type: 'UPDATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        thumbnail: payload.thumbnail,
                    },
                };
            }));
        });
    }
}
exports.AgentB2CSubSiteConfigService = AgentB2CSubSiteConfigService;
