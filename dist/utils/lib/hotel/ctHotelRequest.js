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
const config_1 = __importDefault(require("../../../config/config"));
const rootModel_1 = __importDefault(require("../../../models/rootModel"));
const constants_1 = require("../../miscellaneous/constants");
const flightConstent_1 = require("../../miscellaneous/flightConstent");
const BASE_URL = config_1.default.CT_URL;
const API_KEY = config_1.default.CT_API_KEY;
class CTHotelRequests {
    // get request
    getRequest(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiUrl = BASE_URL + endpoint;
            try {
                const headers = {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                };
                const response = yield axios_1.default.get(apiUrl, { headers });
                const data = response.data;
                if (data.success) {
                    return data;
                }
                else {
                    yield new rootModel_1.default().ErrorLogsModel().insertErrorLogs({
                        level: constants_1.ERROR_LEVEL_WARNING,
                        message: `Error from Cholo Travel API`,
                        url: apiUrl,
                        http_method: 'GET',
                        metadata: {
                            api: flightConstent_1.CT_API,
                            endpoint: apiUrl,
                            payload: '',
                            response: data.message,
                        },
                    });
                    return false;
                }
            }
            catch (error) {
                yield new rootModel_1.default().ErrorLogsModel().insertErrorLogs({
                    level: constants_1.ERROR_LEVEL_WARNING,
                    message: `Error from Cholo Travel API`,
                    url: apiUrl,
                    http_method: 'GET',
                    metadata: {
                        api: flightConstent_1.CT_API,
                        endpoint: apiUrl,
                        payload: '',
                        response: error,
                    },
                });
                console.error('Error calling API:', error.response.status);
                return false;
            }
        });
    }
    postRequest(endpoint, requestData) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiUrl = BASE_URL + endpoint;
            try {
                const headers = {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                };
                const response = yield axios_1.default.request({
                    method: 'post',
                    url: apiUrl,
                    headers: headers,
                    data: requestData,
                    validateStatus: () => true,
                });
                if (!response.data.success) {
                    yield new rootModel_1.default().ErrorLogsModel().insertErrorLogs({
                        level: constants_1.ERROR_LEVEL_WARNING,
                        message: `Error from Cholo Travel API`,
                        url: apiUrl,
                        http_method: 'POST',
                        metadata: {
                            api: flightConstent_1.CT_API,
                            endpoint: apiUrl,
                            payload: requestData,
                            response: response.data,
                        },
                    });
                    return false;
                }
                return response.data;
            }
            catch (error) {
                yield new rootModel_1.default().ErrorLogsModel().insertErrorLogs({
                    level: constants_1.ERROR_LEVEL_WARNING,
                    message: `Error from Cholo Travel API`,
                    url: apiUrl,
                    http_method: 'POST',
                    metadata: {
                        api: flightConstent_1.CT_API,
                        endpoint: apiUrl,
                        payload: requestData,
                        response: error,
                    },
                });
                console.log(error);
                return false;
            }
        });
    }
}
exports.default = CTHotelRequests;
