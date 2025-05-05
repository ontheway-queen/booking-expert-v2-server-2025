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
exports.AdminHolidayService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const holidayConstants_1 = require("../../../utils/miscellaneous/holidayConstants");
class AdminHolidayService extends abstract_service_1.default {
    createHoliday(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const body = req.body;
                const { pricing, itinerary, services, city_id } = body, rest = __rest(body, ["pricing", "itinerary", "services", "city_id"]);
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const holidayPackageCityModel = this.Model.HolidayPackageCityModel(trx);
                const holidayPackagePricingModel = this.Model.HolidayPackagePricingModel(trx);
                const holidayPackageImagesModel = this.Model.HolidayPackageImagesModel(trx);
                const holidayPackageServiceModel = this.Model.HolidayPackageServiceModel(trx);
                const holidayPackageItineraryModel = this.Model.HolidayPackageItineraryModel(trx);
                //check slug
                const slugCheck = yield holidayPackageModel.getHolidayPackageList({ slug: rest.slug, created_by: holidayConstants_1.HOLIDAY_CREATED_BY_ADMIN });
                if (slugCheck.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.SLUG_ALREADY_EXISTS
                    };
                }
                //insert holiday package
                const holidayPackage = yield holidayPackageModel.insertHolidayPackage(Object.assign(Object.assign({}, rest), { created_by: holidayConstants_1.HOLIDAY_CREATED_BY_ADMIN, created_by_id: user_id }));
                //insert city
                const holidayPackageCityBody = city_id.map((item) => ({
                    holiday_package_id: holidayPackage[0].id,
                    city_id: item
                }));
                yield holidayPackageCityModel.createHolidayPackageCity(holidayPackageCityBody);
                //insert pricing
                const pricing_body = pricing.map((item) => (Object.assign(Object.assign({}, item), { holiday_package_id: holidayPackage[0].id })));
                yield holidayPackagePricingModel.insertHolidayPackagePricing(pricing_body);
                //insert itinerary
                const itinerary_body = itinerary.map((item) => (Object.assign(Object.assign({}, item), { holiday_package_id: holidayPackage[0].id })));
                yield holidayPackageItineraryModel.insertHolidayPackageItinerary(itinerary_body);
                //insert services
                const services_body = services.map((item) => (Object.assign(Object.assign({}, item), { holiday_package_id: holidayPackage[0].id })));
                yield holidayPackageServiceModel.insertHolidayPackageService(services_body);
                //insert images
                const image_body = [];
                const files = req.files;
                if (files.length) {
                    for (const file of files) {
                        image_body.push({
                            holiday_package_id: holidayPackage[0].id,
                            image: file.filename
                        });
                    }
                    yield holidayPackageImagesModel.insertHolidayPackageImages(image_body);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Holiday package has been created successfully",
                    data: {
                        id: holidayPackage[0].id,
                        image_body
                    }
                };
            }));
        });
    }
    getHolidayPackageList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const query = req.query;
                query.created_by = holidayConstants_1.HOLIDAY_CREATED_BY_ADMIN;
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const data = yield holidayPackageModel.getHolidayPackageList(query, true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: data.total,
                    data: data.data
                };
            }));
        });
    }
    getSingleHolidayPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const data = yield holidayPackageModel.getSingleHolidayPackage({ id: Number(id), created_by: holidayConstants_1.HOLIDAY_CREATED_BY_ADMIN });
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
                    data: data
                };
            }));
        });
    }
    updateHolidayPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                const { id } = req.params;
                const body = req.body;
                const { pricing, itinerary, services, delete_images, city } = body, rest = __rest(body, ["pricing", "itinerary", "services", "delete_images", "city"]);
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const holidayPackageCityModel = this.Model.HolidayPackageCityModel(trx);
                const holidayPackagePricingModel = this.Model.HolidayPackagePricingModel(trx);
                const holidayPackageImagesModel = this.Model.HolidayPackageImagesModel(trx);
                const holidayPackageServiceModel = this.Model.HolidayPackageServiceModel(trx);
                const holidayPackageItineraryModel = this.Model.HolidayPackageItineraryModel(trx);
                const data = yield holidayPackageModel.getSingleHolidayPackage({ id: Number(id), created_by: holidayConstants_1.HOLIDAY_CREATED_BY_ADMIN });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Holiday package not found"
                    };
                }
                //check slug
                if (rest.slug) {
                    const slugCheck = yield holidayPackageModel.getHolidayPackageList({ slug: rest.slug, created_by: holidayConstants_1.HOLIDAY_CREATED_BY_ADMIN });
                    if (slugCheck.data.length && Number((_b = (_a = slugCheck.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id) !== Number(id)) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: this.ResMsg.SLUG_ALREADY_EXISTS
                        };
                    }
                }
                //update holiday package
                yield holidayPackageModel.updateHolidayPackage(rest, Number(id));
                //update city
                if (city) {
                    if ((_c = city.add) === null || _c === void 0 ? void 0 : _c.length) {
                        const cityInsertBody = city.add.map((item) => ({
                            holiday_package_id: Number(id),
                            city_id: item
                        }));
                        yield holidayPackageCityModel.createHolidayPackageCity(cityInsertBody);
                    }
                    if ((_d = city.delete) === null || _d === void 0 ? void 0 : _d.length) {
                        const cityDeleteBody = city.delete.map((item) => ({
                            holiday_package_id: Number(id),
                            city_id: item
                        }));
                        yield holidayPackageCityModel.deleteHolidayPackageCity(cityDeleteBody);
                    }
                }
                //update pricing
                if (pricing) {
                    if ((_e = pricing.delete) === null || _e === void 0 ? void 0 : _e.length) {
                        yield holidayPackagePricingModel.deleteHolidayPackagePricing(pricing.delete);
                    }
                    if ((_f = pricing.update) === null || _f === void 0 ? void 0 : _f.length) {
                        yield Promise.all(pricing.update.map((_a) => {
                            var { id } = _a, rest = __rest(_a, ["id"]);
                            return holidayPackagePricingModel.updateHolidayPackagePricing(rest, id);
                        }));
                    }
                    if ((_g = pricing.add) === null || _g === void 0 ? void 0 : _g.length) {
                        yield Promise.all(pricing.add.map((item) => __awaiter(this, void 0, void 0, function* () {
                            const checkDuplicateEntry = yield holidayPackagePricingModel.getHolidayPackagePricingList({
                                holiday_package_id: Number(id),
                                price_for: item.price_for
                            });
                            if (checkDuplicateEntry.length) {
                                throw new customError_1.default(`Duplicate pricing entry for - ${item.price_for}`, this.StatusCode.HTTP_CONFLICT);
                            }
                            yield holidayPackagePricingModel.insertHolidayPackagePricing(Object.assign(Object.assign({}, item), { holiday_package_id: Number(id) }));
                        })));
                    }
                }
                //update itinerary
                if (itinerary) {
                    if ((_h = itinerary.delete) === null || _h === void 0 ? void 0 : _h.length) {
                        yield holidayPackageItineraryModel.deleteHolidayPackageItinerary(itinerary.delete);
                    }
                    if ((_j = itinerary.update) === null || _j === void 0 ? void 0 : _j.length) {
                        yield Promise.all(itinerary.update.map((_a) => {
                            var { id } = _a, rest = __rest(_a, ["id"]);
                            return holidayPackageItineraryModel.updateHolidayPackageItinerary(rest, id);
                        }));
                    }
                    if ((_k = itinerary.add) === null || _k === void 0 ? void 0 : _k.length) {
                        const itineraryBody = itinerary.add.map((item) => (Object.assign(Object.assign({}, item), { holiday_package_id: Number(id) })));
                        yield holidayPackageItineraryModel.insertHolidayPackageItinerary(itineraryBody);
                    }
                }
                //update services
                if (services) {
                    if ((_l = services.delete) === null || _l === void 0 ? void 0 : _l.length) {
                        yield holidayPackageServiceModel.deleteHolidayPackageService(services.delete);
                    }
                    if ((_m = services.update) === null || _m === void 0 ? void 0 : _m.length) {
                        yield Promise.all(services.update.map((_a) => {
                            var { id } = _a, rest = __rest(_a, ["id"]);
                            return holidayPackageServiceModel.updateHolidayPackageService(rest, id);
                        }));
                    }
                    if ((_o = services.add) === null || _o === void 0 ? void 0 : _o.length) {
                        const servicesBody = services.add.map((item) => (Object.assign(Object.assign({}, item), { holiday_package_id: Number(id) })));
                        yield holidayPackageServiceModel.insertHolidayPackageService(servicesBody);
                    }
                }
                //update images
                if (delete_images === null || delete_images === void 0 ? void 0 : delete_images.length) {
                    const imageData = yield holidayPackageImagesModel.getHolidayPackageImagesById(delete_images);
                    const imagePaths = imageData.map((item) => item.image);
                    yield this.manageFile.deleteFromCloud(imagePaths);
                    yield holidayPackageImagesModel.deleteHolidayPackageImages(delete_images);
                }
                const files = req.files || [];
                const imageBody = [];
                if (files.length) {
                    for (const file of files) {
                        imageBody.push({
                            holiday_package_id: Number(id),
                            image: file.filename
                        });
                    }
                    yield holidayPackageImagesModel.insertHolidayPackageImages(imageBody);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Holiday package has been updated successfully",
                    data: {
                        imageBody
                    }
                };
            }));
        });
    }
    deleteHolidayPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const data = yield holidayPackageModel.getSingleHolidayPackage({ id: Number(id), created_by: holidayConstants_1.HOLIDAY_CREATED_BY_ADMIN });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Holiday package not found"
                    };
                }
                yield holidayPackageModel.updateHolidayPackage({ is_deleted: true }, Number(id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Holiday package has been deleted successfully"
                };
            }));
        });
    }
}
exports.AdminHolidayService = AdminHolidayService;
