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
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AgentB2CSubUmrahService extends abstract_service_1.default {
    //create umrah package
    createUmrahPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { agency_id, user_id } = req.agencyUser;
                const model = this.Model.UmrahPackageModel(trx);
                const files = req.files || [];
                const reqBody = req.body;
                const { slug, package_include } = reqBody, payload = __rest(reqBody, ["slug", "package_include"]);
                const check_slug = yield model.getSingleAgentB2CUmrahPackageDetails({
                    source_id: agency_id,
                    slug,
                });
                if (check_slug) {
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
                payload.thumbnail = (_a = files.find((file) => file.fieldname === 'thumbnail')) === null || _a === void 0 ? void 0 : _a.filename;
                const res = yield model.insertUmrahPackage(payload);
                if (res.length) {
                    if (files.length) {
                        const imagePayload = [];
                        files.forEach((file) => {
                            if (file.fieldname !== 'thumbnail') {
                                imagePayload.push({
                                    umrah_id: res[0].id,
                                    image: file.filename,
                                });
                            }
                        });
                        yield model.insertUmrahPackageImage(imagePayload);
                    }
                    if (package_include === null || package_include === void 0 ? void 0 : package_include.length) {
                        const include_service_payload = [];
                        package_include.forEach((service_name) => {
                            include_service_payload.push({
                                umrah_id: res[0].id,
                                service_name,
                            });
                        });
                        yield model.insertPackageInclude(include_service_payload);
                    }
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    //get umrah package list
    getUmrahPackageList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const { limit, skip, status, filter } = req.query;
            const model = this.Model.UmrahPackageModel();
            const { data, total } = yield model.getUmrahPackageList({
                source_id: agency_id,
                source_type: constants_1.SOURCE_AGENT,
                status,
                limit,
                skip,
                filter,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total,
                data,
            };
        });
    }
    //get single umrah package
    getSingleUmrahPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.UmrahPackageModel();
            const data = yield model.getSingleUmrahPackage({ umrah_id: Number(id) });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const images = yield model.getSingleUmrahPackageImages({ umrah_id: Number(id) });
            const included_services = yield model.getSingleUmrahPackageIncludedService({
                umrah_id: Number(id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, data), { images: images || [], included_services: included_services || [] }),
            };
        });
    }
    //update umrah package
    updateUmrahPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const model = this.Model.UmrahPackageModel(trx);
                const files = req.files || [];
                const { id } = req.params;
                const check = yield model.getSingleUmrahPackage({
                    umrah_id: Number(id),
                });
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const reqBody = req.body;
                const { add_package_include, remove_images, remove_package_include } = reqBody, payload = __rest(reqBody, ["add_package_include", "remove_images", "remove_package_include"]);
                if (payload.slug) {
                    const check_slug = yield model.getSingleAgentB2CUmrahPackageDetails({
                        source_id: agency_id,
                        slug: payload.slug,
                    });
                    if (check_slug && check_slug.id !== Number(id)) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: this.ResMsg.SLUG_EXISTS,
                        };
                    }
                }
                //remove images
                if (remove_images.length) {
                    const removeImage = [];
                    for (const image_id of remove_images) {
                        const image = yield model.getSingleUmrahPackageImage({ image_id });
                        if (image) {
                            removeImage.push(image.image);
                        }
                        yield model.deleteUmrahPackageImage({ image_id });
                    }
                    yield this.manageFile.deleteFromCloud(removeImage);
                }
                //remove included services
                if (remove_package_include.length) {
                    for (const service_id of remove_package_include) {
                        yield model.deleteUmrahPackageIncludedService({ id: service_id });
                    }
                }
                //add new included services
                if (add_package_include === null || add_package_include === void 0 ? void 0 : add_package_include.length) {
                    const include_service_payload = [];
                    add_package_include.forEach((service_name) => {
                        include_service_payload.push({
                            umrah_id: Number(id),
                            service_name,
                        });
                    });
                    yield model.insertPackageInclude(include_service_payload);
                }
                if (files.length) {
                    const imagePayload = [];
                    files.forEach((file) => {
                        if (file.fieldname !== 'thumbnail') {
                            imagePayload.push({
                                umrah_id: Number(id),
                                image: file.filename,
                            });
                        }
                    });
                    yield model.insertUmrahPackageImage(imagePayload);
                }
                if (files.length) {
                    for (const file of files) {
                        if (file.fieldname === 'thumbnail') {
                            payload.thumbnail = file.filename;
                            yield this.manageFile.deleteFromCloud([check.thumbnail]);
                        }
                    }
                }
                yield model.updateUmrahPackage({ data: payload, umrah_id: Number(id) });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK
                };
            }));
        });
    }
}
exports.AgentB2CSubUmrahService = AgentB2CSubUmrahService;
