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
exports.AgentB2CSubVisaService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AgentB2CSubVisaService extends abstract_service_1.default {
    createVisa(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const model = this.Model.VisaModel(trx);
                const files = req.files || [];
                const reqBody = req.body;
                const { slug } = reqBody, payload = __rest(reqBody, ["slug"]);
                const check_slug = yield model.checkVisa({
                    slug,
                    is_deleted: false,
                    source_id: agency_id,
                });
                if (check_slug.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.SLUG_EXISTS,
                    };
                }
                payload.slug = slug;
                payload.source_type = constants_1.SOURCE_AGENT;
                payload.source_id = agency_id;
                payload.created_by = user_id;
                const image = files.find((file) => file.fieldname === 'image');
                if (!image) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Image is required',
                    };
                }
                payload.image = image.filename;
                yield model.createVisa(payload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Visa created successfully',
                };
            }));
        });
    }
    getVisaList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { filter, country_id, limit, skip, status } = req.query;
            const { agency_id } = req.agencyUser;
            const visaModel = this.Model.VisaModel();
            const { data, total } = yield visaModel.getVisaList({
                filter,
                country_id,
                status,
                limit,
                skip,
                source_id: agency_id,
                source_type: constants_1.SOURCE_AGENT,
                is_deleted: false,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    getSingleVisa(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { agency_id } = req.agencyUser;
            const visaModel = this.Model.VisaModel();
            const data = yield visaModel.getSingleVisa({
                is_deleted: false,
                source_id: agency_id,
                source_type: constants_1.SOURCE_AGENT,
                id: Number(id),
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
    updateVisa(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { agency_id } = req.agencyUser;
                const visaModel = this.Model.VisaModel(trx);
                const checkExist = yield visaModel.getSingleVisa({
                    is_deleted: false,
                    source_id: agency_id,
                    source_type: constants_1.SOURCE_AGENT,
                    id: Number(id),
                });
                if (!checkExist) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const payload = req.body;
                if (payload.slug) {
                    const check_slug = yield visaModel.checkVisa({
                        is_deleted: false,
                        source_id: agency_id,
                        slug: payload.slug,
                    });
                    if (check_slug.length && check_slug[0].id !== Number(id)) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: this.ResMsg.SLUG_EXISTS,
                        };
                    }
                }
                const files = req.files || [];
                const image = files.find((file) => file.fieldname === 'image');
                const deleteImage = [];
                if (image) {
                    payload.image = image.filename;
                    deleteImage.push(checkExist.image);
                }
                if (payload && Object.keys(payload).length) {
                    yield visaModel.updateVisa(payload, Number(id));
                }
                if (deleteImage.length) {
                    this.manageFile.deleteFromCloud(deleteImage);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Visa updated successfully',
                };
            }));
        });
    }
    deleteVisa(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { agency_id } = req.agencyUser;
            const visaModel = this.Model.VisaModel();
            const checkExist = yield visaModel.getSingleVisa({
                is_deleted: false,
                source_id: agency_id,
                source_type: constants_1.SOURCE_AGENT,
                id: Number(id),
            });
            if (!checkExist) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield visaModel.updateVisa({ is_deleted: true }, Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Visa deleted successfully',
            };
        });
    }
}
exports.AgentB2CSubVisaService = AgentB2CSubVisaService;
