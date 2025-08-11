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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminConfigService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const holidayConstants_1 = require("../../../utils/miscellaneous/holidayConstants");
class AdminConfigService extends abstract_service_1.default {
    checkSlug(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { slug, type } = req.query;
                if (type === constants_1.SLUG_TYPE_HOLIDAY) {
                    const holidayModel = this.Model.HolidayPackageModel(trx);
                    const check_slug = yield holidayModel.getHolidayPackageList({
                        slug,
                        created_by: holidayConstants_1.HOLIDAY_CREATED_BY_ADMIN,
                    });
                    if (check_slug.data.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: this.ResMsg.SLUG_ALREADY_EXISTS,
                        };
                    }
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.AVAILABLE_SLUG,
                };
            }));
        });
    }
    //get all city
    getAllCity(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.CommonModel();
            const city_list = yield model.getCity(req.query, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: city_list.data,
                total: city_list.total,
            };
        });
    }
    createCity(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const model = this.Model.CommonModel();
            yield model.insertCity(body);
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    updateCity(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const id = req.params.id;
            const model = this.Model.CommonModel();
            yield model.updateCity(body, Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    deleteCity(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const model = this.Model.CommonModel();
            yield model.deleteCity(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    //get all airport
    getAllAirport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.CommonModel();
            const get_airport = yield model.getAirport(req.query, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: get_airport.data,
                total: get_airport.total,
            };
        });
    }
    createAirport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            const model = this.Model.CommonModel();
            const checkAirport = yield model.getAirlineByCode(body.iata_code);
            if (checkAirport.name !== 'Not available') {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: 'Airport code already exist.',
                };
            }
            yield model.insertAirport(body);
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    //update airport
    updateAirport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const airport_id = req.params.id;
            const body = req.body;
            const model = this.Model.CommonModel();
            const update_airport = yield model.updateAirport(body, Number(airport_id));
            if (update_airport > 0) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }
            else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
        });
    }
    //delete airport
    deleteAirport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const airport_id = req.params.id;
            const model = this.Model.CommonModel();
            const del_airport = yield model.deleteAirport(Number(airport_id));
            if (del_airport > 0) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }
            else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
        });
    }
    getAllAirlines(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.CommonModel();
            const get_airlines = yield model.getAirlines(req.query, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: get_airlines.data,
                total: get_airlines.total,
            };
        });
    }
    createAirlines(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = req.files || [];
            const model = this.Model.CommonModel();
            const body = req.body;
            const check = yield model.getAirlineByCode(body.code);
            if (check.name !== 'Not available') {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: 'Airlines code already exist.',
                };
            }
            const payload = Object.assign(Object.assign({}, req.body), { logo: '' });
            if (files === null || files === void 0 ? void 0 : files.length) {
                payload.logo = files[0].filename;
            }
            yield model.insertAirline(payload);
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    //update airline
    updateAirlines(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const airlines_id = req.params.id;
            const model = this.Model.CommonModel();
            const check = yield model.getAirlineById(Number(airlines_id));
            if (!check) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const files = req.files || [];
            const body = Object.assign({}, req.body);
            if (files === null || files === void 0 ? void 0 : files.length) {
                body.logo = files[0].filename;
            }
            yield model.updateAirlines(body, Number(airlines_id));
            if (check.logo && body.logo) {
                yield this.manageFile.deleteFromCloud([check.logo]);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    //delete airline
    deleteAirlines(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const airlines_id = req.params.id;
            const model = this.Model.CommonModel();
            const check = yield model.getAirlineById(Number(airlines_id));
            if (!check) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.deleteAirlines(Number(airlines_id));
            if (check.logo) {
                yield this.manageFile.deleteFromCloud([check.logo]);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    // get b2c markup
    getB2CMarkupSet(_req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.B2CMarkupConfigModel();
            const b2c_markup = yield model.getB2CMarkupConfigData('Both');
            const data = {};
            b2c_markup.forEach((markup) => {
                if (markup.type === 'Flight') {
                    data.flight_markup_set = Object.assign({}, markup);
                }
                if (markup.type === 'Hotel') {
                    data.hotel_markup_set = Object.assign({}, markup);
                }
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
    // UPDATE B2C MARKUP
    updateB2CMarkupConfig(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                const { user_id } = req.admin;
                const B2CMarkupConfigModel = this.Model.B2CMarkupConfigModel();
                const markupSetModel = this.Model.DynamicFareSetModel();
                if (body.flight_set_id) {
                    // Check if the markup set exists
                    const existingFlightMarkupSet = yield markupSetModel.checkDynamicFareSet({
                        id: body.flight_set_id,
                        type: constants_1.TYPE_FLIGHT,
                    });
                    if (!existingFlightMarkupSet) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: 'Flight set not found.',
                        };
                    }
                    yield B2CMarkupConfigModel.upsertB2CMarkupConfig({
                        type: 'Flight',
                        markup_set_id: body.flight_set_id,
                    });
                }
                if (body.hotel_set_id) {
                    // Check if the markup set exists
                    const existingHotelMarkupSet = yield markupSetModel.checkDynamicFareSet({
                        id: body.hotel_set_id,
                        type: constants_1.TYPE_HOTEL,
                    });
                    if (!existingHotelMarkupSet) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: 'Hotel set not found.',
                        };
                    }
                    yield B2CMarkupConfigModel.upsertB2CMarkupConfig({
                        type: 'Hotel',
                        markup_set_id: body.hotel_set_id,
                    });
                }
                yield this.insertAdminAudit(trx, {
                    created_by: user_id,
                    details: 'B2C Markup config updated',
                    type: 'UPDATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    // Get bank
    getBank(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const CommonModel = this.Model.CommonModel(trx);
                const { filter, status } = req.query;
                const banks = yield CommonModel.getBanks({
                    name: filter,
                    status: status,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: banks,
                };
            }));
        });
    }
    // Create bank
    createBank(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const CommonModel = this.Model.CommonModel(trx);
                const body = req.body;
                const files = req.files || [];
                yield CommonModel.insertBanks(Object.assign(Object.assign({}, body), { logo: (_a = files[0]) === null || _a === void 0 ? void 0 : _a.filename }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    // Update Bank
    updateBank(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const CommonModel = this.Model.CommonModel(trx);
                const bank_id = Number(req.params.id);
                const check = yield CommonModel.checkBank(bank_id);
                if (!check) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const body = req.body;
                const files = req.files || [];
                const payload = Object.assign({}, body);
                if (files.length) {
                    payload.logo = files[0].filename;
                }
                if (!Object.keys(payload).length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.HTTP_BAD_REQUEST,
                    };
                }
                yield CommonModel.updateBanks(payload, bank_id);
                if (check.logo && payload.logo) {
                    yield this.manageFile.deleteFromCloud([check.logo]);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
}
exports.AdminConfigService = AdminConfigService;
