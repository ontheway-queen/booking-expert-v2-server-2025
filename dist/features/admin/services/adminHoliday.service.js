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
class AdminHolidayService extends abstract_service_1.default {
    createHoliday(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const body = req.body;
                const { pricing, itinerary, services } = body, rest = __rest(body, ["pricing", "itinerary", "services"]);
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const holidayPackagePricingModel = this.Model.HolidayPackagePricingModel(trx);
                const holidayPackageImagesModel = this.Model.HolidayPackageImagesModel(trx);
                const holidayPackageServiceModel = this.Model.HolidayPackageServiceModel(trx);
                const holidayPackageItineraryModel = this.Model.HolidayPackageItineraryModel(trx);
                //check slug
                const slugCheck = yield holidayPackageModel.getHolidayPackageList({ slug: rest.slug });
                if (slugCheck.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.SLUG_ALREADY_EXISTS
                    };
                }
                //insert holiday package
                const holidayPackage = yield holidayPackageModel.insertHolidayPackage(Object.assign(Object.assign({}, rest), { created_by: user_id }));
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
                }
                yield holidayPackageImagesModel.insertHolidayPackageImages(image_body);
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
                const data = yield holidayPackageModel.getSingleHolidayPackage({ id: Number(id) });
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
                var _a, _b;
                const { id } = req.params;
                const body = req.body;
                const { pricing, itinerary, services, delete_images } = body, rest = __rest(body, ["pricing", "itinerary", "services", "delete_images"]);
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const holidayPackagePricingModel = this.Model.HolidayPackagePricingModel(trx);
                const holidayPackageImagesModel = this.Model.HolidayPackageImagesModel(trx);
                const holidayPackageServiceModel = this.Model.HolidayPackageServiceModel(trx);
                const holidayPackageItineraryModel = this.Model.HolidayPackageItineraryModel(trx);
                //check slug
                if (rest.slug) {
                    const slugCheck = yield holidayPackageModel.getHolidayPackageList({ slug: rest.slug });
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
                //update pricing
                if (pricing) {
                    if (pricing.delete) {
                        yield holidayPackagePricingModel.deleteHolidayPackagePricing(pricing.delete);
                    }
                    if (pricing.update) {
                        yield Promise.all(pricing.update.map((_a) => {
                            var { id } = _a, rest = __rest(_a, ["id"]);
                            return holidayPackagePricingModel.updateHolidayPackagePricing(rest, id);
                        }));
                    }
                    if (pricing.add) {
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
                    if (itinerary.delete) {
                        yield holidayPackageItineraryModel.deleteHolidayPackageItinerary(itinerary.delete);
                    }
                    if (itinerary.update) {
                        yield Promise.all(itinerary.update.map((_a) => {
                            var { id } = _a, rest = __rest(_a, ["id"]);
                            return holidayPackageItineraryModel.updateHolidayPackageItinerary(rest, id);
                        }));
                    }
                    if (itinerary.add) {
                        const itineraryBody = itinerary.add.map((item) => (Object.assign(Object.assign({}, item), { holiday_package_id: Number(id) })));
                        yield holidayPackageItineraryModel.insertHolidayPackageItinerary(itineraryBody);
                    }
                }
                //update services
                if (services) {
                    if (services.delete) {
                        yield holidayPackageServiceModel.deleteHolidayPackageService(services.delete);
                    }
                    if (services.update) {
                        yield Promise.all(services.update.map((_a) => {
                            var { id } = _a, rest = __rest(_a, ["id"]);
                            return holidayPackageServiceModel.updateHolidayPackageService(rest, id);
                        }));
                    }
                    if (services.add) {
                        const servicesBody = services.add.map((item) => (Object.assign(Object.assign({}, item), { holiday_package_id: Number(id) })));
                        yield holidayPackageServiceModel.insertHolidayPackageService(servicesBody);
                    }
                }
                //update images
                if (delete_images) {
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
}
exports.AdminHolidayService = AdminHolidayService;
