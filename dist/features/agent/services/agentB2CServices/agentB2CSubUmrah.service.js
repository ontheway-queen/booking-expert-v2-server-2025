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
exports.AgentB2CSubUmrahService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const umrahConstants_1 = require("../../../../utils/miscellaneous/umrahConstants");
class AgentB2CSubUmrahService extends abstract_service_1.default {
    createUmrahPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const model = this.Model.UmrahPackageModel(trx);
                const files = req.files || [];
                const reqBody = req.body;
                const { slug, package_include } = reqBody, payload = __rest(reqBody, ["slug", "package_include"]);
                const check_slug = yield model.getSingleAgentB2CUmrahPackageDetails({
                    slug: slug,
                    source_id: agency_id,
                });
                if (check_slug) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.SLUG_EXISTS,
                    };
                }
                payload.slug = slug;
                payload.source_type = umrahConstants_1.SOURCE_TYPE.AGENT;
                payload.source_id = agency_id;
                payload.created_by = user_id;
                const res = yield model.insertUmrahPackage(payload);
                const imagePayload = [];
                if (res.length) {
                    files.forEach((file) => {
                        imagePayload.push({
                            umrah_id: res[0].id,
                            image: file.filename,
                        });
                    });
                    yield model.insertUmrahPackageImage(imagePayload);
                }
            }));
        });
    }
}
exports.AgentB2CSubUmrahService = AgentB2CSubUmrahService;
