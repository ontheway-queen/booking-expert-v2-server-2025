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
exports.AgentB2CSubHolidayService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const holidayConstants_1 = require("../../../../utils/miscellaneous/holidayConstants");
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AgentB2CSubHolidayService extends abstract_service_1.default {
    createHoliday(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id, agency_id } = req.agencyUser;
                const body = req.body;
                const { pricing, itinerary, services, city_id } = body, rest = __rest(body, ["pricing", "itinerary", "services", "city_id"]);
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const holidayPackageCityModel = this.Model.HolidayPackageCityModel(trx);
                const holidayPackagePricingModel = this.Model.HolidayPackagePricingModel(trx);
                const holidayPackageImagesModel = this.Model.HolidayPackageImagesModel(trx);
                const holidayPackageServiceModel = this.Model.HolidayPackageServiceModel(trx);
                const holidayPackageItineraryModel = this.Model.HolidayPackageItineraryModel(trx);
                //check slug
                const slugCheck = yield holidayPackageModel.getHolidayPackageList({
                    slug: rest.slug,
                    created_by: holidayConstants_1.HOLIDAY_CREATED_BY_AGENT,
                    agency_id,
                });
                if (slugCheck.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.SLUG_ALREADY_EXISTS,
                    };
                }
                //insert holiday package
                const holidayPackage = yield holidayPackageModel.insertHolidayPackage(Object.assign(Object.assign({}, rest), { created_by: holidayConstants_1.HOLIDAY_CREATED_BY_AGENT, created_by_id: user_id, holiday_for: holidayConstants_1.HOLIDAY_FOR_AGENT_B2C, agency_id }));
                //insert city
                const holidayPackageCityBody = city_id.map((item) => ({
                    holiday_package_id: holidayPackage[0].id,
                    city_id: item,
                }));
                yield holidayPackageCityModel.createHolidayPackageCity(holidayPackageCityBody);
                //insert pricing
                yield holidayPackagePricingModel.insertHolidayPackagePricing(Object.assign(Object.assign({}, pricing), { holiday_package_id: holidayPackage[0].id, price_for: holidayConstants_1.HOLIDAY_FOR_AGENT_B2C }));
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
                            image: file.filename,
                        });
                    }
                    yield holidayPackageImagesModel.insertHolidayPackageImages(image_body);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Holiday package has been created successfully',
                    data: {
                        id: holidayPackage[0].id,
                        image_body,
                    },
                };
            }));
        });
    }
    getHolidayPackageList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const query = req.query;
                query.created_by = holidayConstants_1.HOLIDAY_CREATED_BY_AGENT;
                query.agency_id = agency_id;
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const data = yield holidayPackageModel.getHolidayPackageList(query, true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: data.total,
                    data: data.data,
                };
            }));
        });
    }
    getSingleHolidayPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const { id } = req.params;
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const data = yield holidayPackageModel.getSingleHolidayPackage({
                    id: Number(id),
                    created_by: holidayConstants_1.HOLIDAY_CREATED_BY_AGENT,
                    agency_id,
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
                    data: data,
                };
            }));
        });
    }
    updateHolidayPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                const { agency_id } = req.agencyUser;
                const { id } = req.params;
                const body = req.body;
                const { pricing, itinerary, services, delete_images, city } = body, rest = __rest(body, ["pricing", "itinerary", "services", "delete_images", "city"]);
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const holidayPackageCityModel = this.Model.HolidayPackageCityModel(trx);
                const holidayPackagePricingModel = this.Model.HolidayPackagePricingModel(trx);
                const holidayPackageImagesModel = this.Model.HolidayPackageImagesModel(trx);
                const holidayPackageServiceModel = this.Model.HolidayPackageServiceModel(trx);
                const holidayPackageItineraryModel = this.Model.HolidayPackageItineraryModel(trx);
                const data = yield holidayPackageModel.getSingleHolidayPackage({
                    id: Number(id),
                    created_by: holidayConstants_1.HOLIDAY_CREATED_BY_AGENT,
                    agency_id,
                });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'Holiday package not found',
                    };
                }
                //check slug
                if (rest.slug) {
                    const slugCheck = yield holidayPackageModel.getHolidayPackageList({
                        slug: rest.slug,
                        created_by: holidayConstants_1.HOLIDAY_CREATED_BY_AGENT,
                        agency_id,
                    });
                    if (slugCheck.data.length &&
                        Number((_b = (_a = slugCheck.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id) !== Number(id)) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: this.ResMsg.SLUG_ALREADY_EXISTS,
                        };
                    }
                }
                //update holiday package
                if (Object.keys(rest).length) {
                    yield holidayPackageModel.updateHolidayPackage(rest, Number(id));
                }
                //update city
                if (city) {
                    if ((_c = city.add) === null || _c === void 0 ? void 0 : _c.length) {
                        const cityInsertBody = city.add.map((item) => ({
                            holiday_package_id: Number(id),
                            city_id: item,
                        }));
                        yield holidayPackageCityModel.createHolidayPackageCity(cityInsertBody);
                    }
                    if ((_d = city.delete) === null || _d === void 0 ? void 0 : _d.length) {
                        const cityDeleteBody = city.delete.map((item) => ({
                            holiday_package_id: Number(id),
                            city_id: item,
                        }));
                        yield holidayPackageCityModel.deleteHolidayPackageCity(cityDeleteBody);
                    }
                }
                //update pricing
                if (pricing) {
                    if (pricing.update) {
                        const _l = pricing.update, { id } = _l, rest = __rest(_l, ["id"]);
                        yield holidayPackagePricingModel.updateHolidayPackagePricing(rest, id);
                    }
                }
                //update itinerary
                if (itinerary) {
                    if ((_e = itinerary.delete) === null || _e === void 0 ? void 0 : _e.length) {
                        yield holidayPackageItineraryModel.deleteHolidayPackageItinerary(itinerary.delete);
                    }
                    if ((_f = itinerary.update) === null || _f === void 0 ? void 0 : _f.length) {
                        yield Promise.all(itinerary.update.map((_a) => {
                            var { id } = _a, rest = __rest(_a, ["id"]);
                            return holidayPackageItineraryModel.updateHolidayPackageItinerary(rest, id);
                        }));
                    }
                    if ((_g = itinerary.add) === null || _g === void 0 ? void 0 : _g.length) {
                        const itineraryBody = itinerary.add.map((item) => (Object.assign(Object.assign({}, item), { holiday_package_id: Number(id) })));
                        yield holidayPackageItineraryModel.insertHolidayPackageItinerary(itineraryBody);
                    }
                }
                //update services
                if (services) {
                    if ((_h = services.delete) === null || _h === void 0 ? void 0 : _h.length) {
                        yield holidayPackageServiceModel.deleteHolidayPackageService(services.delete);
                    }
                    if ((_j = services.update) === null || _j === void 0 ? void 0 : _j.length) {
                        yield Promise.all(services.update.map((_a) => {
                            var { id } = _a, rest = __rest(_a, ["id"]);
                            return holidayPackageServiceModel.updateHolidayPackageService(rest, id);
                        }));
                    }
                    if ((_k = services.add) === null || _k === void 0 ? void 0 : _k.length) {
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
                            image: file.filename,
                        });
                    }
                    yield holidayPackageImagesModel.insertHolidayPackageImages(imageBody);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Holiday package has been updated successfully',
                    data: {
                        imageBody,
                    },
                };
            }));
        });
    }
    deleteHolidayPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const { id } = req.params;
                const holidayPackageModel = this.Model.HolidayPackageModel(trx);
                const data = yield holidayPackageModel.getSingleHolidayPackage({
                    id: Number(id),
                    created_by: holidayConstants_1.HOLIDAY_CREATED_BY_AGENT,
                    agency_id,
                });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'Holiday package not found',
                    };
                }
                yield holidayPackageModel.updateHolidayPackage({ is_deleted: true }, Number(id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Holiday package has been deleted successfully',
                };
            }));
        });
    }
    getHolidayPackageBookingList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const holidayPackageBookingModel = this.Model.HolidayPackageBookingModel(trx);
                const query = req.query;
                const getBookingList = yield holidayPackageBookingModel.getHolidayBookingList(Object.assign({ source_type: constants_1.SOURCE_AGENT_B2C, source_id: agency_id }, query), true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: getBookingList.total,
                    data: getBookingList.data,
                };
            }));
        });
    }
    getSingleHolidayPackageBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const holidayPackageBookingModel = this.Model.HolidayPackageBookingModel(trx);
                const { id } = req.params;
                const get_booking = yield holidayPackageBookingModel.getSingleHolidayBooking({
                    id,
                    booked_by: constants_1.SOURCE_AGENT_B2C,
                    source_id: agency_id,
                });
                if (!get_booking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                else {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        data: get_booking,
                    };
                }
            }));
        });
    }
}
exports.AgentB2CSubHolidayService = AgentB2CSubHolidayService;
