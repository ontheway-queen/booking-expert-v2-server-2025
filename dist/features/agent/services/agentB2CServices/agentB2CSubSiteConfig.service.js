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
                const _a = req.body, { emails, numbers, address } = _a, body = __rest(_a, ["emails", "numbers", "address"]);
                const files = req.files || [];
                const { agency_id, user_id } = req.agencyUser;
                const AgencyB2CConfigModel = this.Model.AgencyB2CConfigModel(trx);
                const checkConfig = yield AgencyB2CConfigModel.getSiteConfig({
                    agency_id,
                });
                const payload = Object.assign({ last_updated: new Date(), updated_by: user_id }, body);
                files.forEach((file) => {
                    if (file.fieldname === "main_logo") {
                        payload.main_logo = file.filename;
                    }
                    if (file.fieldname === "site_thumbnail") {
                        payload.site_thumbnail = file.filename;
                    }
                    if (file.fieldname === "fabicon") {
                        payload.fabicon = file.filename;
                    }
                });
                if (emails === null || emails === void 0 ? void 0 : emails.length) {
                    payload.emails = JSON.stringify(emails);
                }
                if (numbers === null || numbers === void 0 ? void 0 : numbers.length) {
                    payload.numbers = JSON.stringify(numbers);
                }
                if (address) {
                    payload.address = JSON.stringify(address);
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
}
exports.AgentB2CSubSiteConfigService = AgentB2CSubSiteConfigService;
