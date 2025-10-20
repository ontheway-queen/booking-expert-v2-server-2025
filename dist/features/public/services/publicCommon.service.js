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
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const config_1 = __importDefault(require("../../../config/config"));
const sabreApiEndpoints_1 = __importDefault(require("../../../utils/miscellaneous/endpoints/sabreApiEndpoints"));
const flightConstant_1 = require("../../../utils/miscellaneous/flightConstant");
const ctHotelSupport_service_1 = require("../../../utils/supportServices/hotelSupportServices/ctHotelSupport.service");
const verteilApiEndpoints_1 = __importDefault(require("../../../utils/miscellaneous/endpoints/verteilApiEndpoints"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const sabreRequest_1 = __importDefault(require("../../../utils/lib/flight/sabreRequest"));
class PublicCommonService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Get Sebre token
    getSabreToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data = qs_1.default.stringify({
                    grant_type: 'password',
                    username: config_1.default.SABRE_USERNAME,
                    password: config_1.default.SABRE_PASSWORD,
                });
                let axiosConfig = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${config_1.default.SABRE_URL}/${sabreApiEndpoints_1.default.GET_TOKEN_ENDPOINT}`,
                    headers: {
                        Authorization: `Basic ${config_1.default.SABRE_AUTH_TOKEN}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    data: data,
                };
                axios_1.default
                    .request(axiosConfig)
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    const data = response.data;
                    const authModel = this.Model.CommonModel();
                    yield authModel.updateEnv(flightConstant_1.SABRE_TOKEN_ENV, data.access_token);
                }))
                    .catch((error) => {
                    console.log(error);
                });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    //get verteil token
    getVerteilToken() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const axiosConfig = {
                        method: 'post',
                        url: `${config_1.default.VERTEIL_URL}${verteilApiEndpoints_1.default.GET_TOKEN_ENDPOINT}`,
                        headers: {
                            Authorization: `Basic ${Buffer.from(`${config_1.default.VERTEIL_USERNAME}:${config_1.default.VERTEIL_PASSWORD}`).toString('base64')}`,
                        },
                        maxBodyLength: Infinity,
                        validateStatus: () => true,
                    };
                    const response = yield axios_1.default.request(axiosConfig);
                    console.log({ response });
                    if (response.status !== 200) {
                        yield this.Model.ErrorLogsModel(trx).insertErrorLogs({
                            level: constants_1.ERROR_LEVEL_CRITICAL,
                            message: `Error from Verteil authentication`,
                            url: axiosConfig.url,
                            http_method: 'POST',
                            metadata: {
                                api: flightConstant_1.VERTEIL_API,
                                endpoint: axiosConfig.url,
                                payload: {
                                    username: config_1.default.VERTEIL_USERNAME,
                                    password: config_1.default.VERTEIL_PASSWORD,
                                },
                                response: response.data,
                            },
                        });
                    }
                    else {
                        const authModel = this.Model.CommonModel(trx);
                        yield authModel.updateEnv(flightConstant_1.VERTEIL_TOKEN_ENV, response.data.access_token);
                    }
                }));
            }
            catch (err) {
                console.error('Verteil Token Error:', err);
            }
        });
    }
    //get all country
    getAllCountry(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, limit, skip } = req.query;
            const model = this.Model.CommonModel();
            const country_list = yield model.getCountry({ name, limit, skip });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: country_list,
            };
        });
    }
    //get all city
    getAllCity(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.CommonModel();
            const city_list = yield model.getCity(req.query, false);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: city_list.data,
            };
        });
    }
    //get all airport
    getAllAirport(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.CommonModel();
            const get_airport = yield model.getAirport(req.query, false);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: get_airport.data,
            };
        });
    }
    getAllAirlines(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.CommonModel();
            const get_airlines = yield model.getAirlines(req.query, false);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: get_airlines.data,
            };
        });
    }
    //get all airport
    getLocationHotel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const CTHotelSupport = new ctHotelSupport_service_1.CTHotelSupportService(trx);
                const { filter } = req.query;
                const get_airport = yield CTHotelSupport.SearchLocation(filter);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: get_airport.success ? get_airport.data : [],
                };
            }));
        });
    }
    //get banks
    getBank(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const CommonModel = this.Model.CommonModel(trx);
                const { filter } = req.query;
                const { data } = yield CommonModel.getBanks({
                    name: filter,
                    status: true,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data,
                };
            }));
        });
    }
    getSocialMedia(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const CommonModel = this.Model.CommonModel(trx);
                const { filter } = req.query;
                const { data } = yield CommonModel.getSocialMedia({
                    name: filter,
                    status: true,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data,
                };
            }));
        });
    }
    //get visa type
    getVisaType(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const CommonModel = this.Model.CommonModel(trx);
                const visaType = yield CommonModel.getVisaType();
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: visaType,
                };
            }));
        });
    }
    getSabreBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pnr_code } = req.params;
            const { authorization } = req.headers;
            if (!authorization) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: this.ResMsg.HTTP_UNAUTHORIZED,
                };
            }
            else {
                const token = authorization.split(' ')[1];
                if (!token) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.HTTP_UNAUTHORIZED,
                    };
                }
                if (token !== flightConstant_1.PUBLIC_PNR_SABRE_API_SECRET) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.HTTP_UNAUTHORIZED,
                    };
                }
            }
            const response = yield new sabreRequest_1.default().postRequest(sabreApiEndpoints_1.default.GET_BOOKING_ENDPOINT, {
                confirmationId: pnr_code,
            });
            if (!response) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: response,
            };
        });
    }
}
exports.default = PublicCommonService;
