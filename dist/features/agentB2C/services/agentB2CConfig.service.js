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
exports.AgentB2CConfigService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AgentB2CConfigService extends abstract_service_1.default {
    constructor() {
        super();
    }
    GetHomePageData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyB2CWhiteLabel;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
                const siteConfig = yield configModel.getSiteConfig({ agency_id });
                if (!siteConfig) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const { agency_id: no_need_agency_id, id, about_us_content, contact_us_content, about_us_thumbnail, contact_us_thumbnail, privacy_policy_content, updated_by, updated_by_name, terms_and_conditions_content, last_updated } = siteConfig, restData = __rest(siteConfig, ["agency_id", "id", "about_us_content", "contact_us_content", "about_us_thumbnail", "contact_us_thumbnail", "privacy_policy_content", "updated_by", "updated_by_name", "terms_and_conditions_content", "last_updated"]);
                const hero_bg_data = yield configModel.getHeroBGContent({
                    agency_id,
                    status: true,
                });
                const hot_deals = yield configModel.getHotDeals({
                    agency_id,
                    status: true,
                });
                const popular_destinations = yield configModel.getPopularDestination({
                    agency_id,
                    status: true,
                });
                const popular_places = yield configModel.getPopularPlaces({
                    agency_id,
                    status: true,
                });
                const social_links = yield configModel.getSocialLink({
                    agency_id,
                    status: true,
                });
                const popUpBanner = yield configModel.getPopUpBanner({
                    agency_id,
                    pop_up_for: "B2C",
                    status: true,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        site_data: restData,
                        hero_bg_data,
                        hot_deals,
                        popular_destinations,
                        popular_places,
                        social_links,
                        popup: {
                            allow: popUpBanner.length ? true : false,
                            pop_up_data: popUpBanner[0],
                        },
                    },
                };
            }));
        });
    }
    GetAboutUsPageData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyB2CWhiteLabel;
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
    GetContactUsPageData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyB2CWhiteLabel;
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
    GetPrivacyPolicyPageData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyB2CWhiteLabel;
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
    GetTermsAndConditionsPageData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyB2CWhiteLabel;
                const configModel = this.Model.AgencyB2CConfigModel(trx);
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
            }));
        });
    }
    GetAccountsData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyB2CWhiteLabel;
            const configModel = this.Model.OthersModel();
            const accounts = yield configModel.getAccount({
                source_type: "AGENT",
                source_id: agency_id,
                status: true,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: accounts,
            };
        });
    }
}
exports.AgentB2CConfigService = AgentB2CConfigService;
