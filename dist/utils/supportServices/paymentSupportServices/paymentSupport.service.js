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
exports.PaymentSupportService = void 0;
const axios_1 = __importDefault(require("axios"));
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const config_1 = __importDefault(require("../../../config/config"));
const qs_1 = __importDefault(require("qs"));
const bkashApiEndpoints_1 = require("../../miscellaneous/endpoints/bkashApiEndpoints");
const constants_1 = require("../../miscellaneous/constants");
const redis_1 = require("../../../app/redis");
const customError_1 = __importDefault(require("../../lib/customError"));
class PaymentSupportService extends abstract_service_1.default {
    SSLPaymentGateway(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const ssl_body = Object.assign(Object.assign({}, payload), { store_id: payload.store_id || config_1.default.SSL_STORE_ID, store_passwd: payload.store_passwd || config_1.default.SSL_STORE_PASSWORD, success_url: `${config_1.default.SERVER_URL}/payment/ssl?status=success&s_page=${payload.success_page}&f_page=${payload.failed_page}`, fail_url: `${config_1.default.SERVER_URL}/payment/ssl?status=failed&page=${payload.failed_page}`, cancel_url: `${config_1.default.SERVER_URL}/payment/ssl?status=cancelled&page=${payload.cancelled_page}`, shipping_method: 'no', product_category: 'General', product_profile: 'General', cus_add1: 'Dhaka', cus_city: 'Dhaka', cus_country: 'Bangladesh' });
                const response = yield axios_1.default.post(`${config_1.default.SSL_URL}/gwprocess/v4/api.php`, qs_1.default.stringify(ssl_body), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
                if (((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.status) === 'SUCCESS') {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        redirect_url: response.data.redirectGatewayURL,
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: 'Something went wrong!',
                    };
                }
            }
            catch (err) {
                console.log('SSL ERROR', err);
                return {
                    success: false,
                    code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: 'Something went wrong',
                };
            }
        });
    }
    getBkashRefreshToken(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const BKASH_APP_KEY = ((_a = payload.cred) === null || _a === void 0 ? void 0 : _a.BKASH_APP_KEY) || config_1.default.BKASH_APP_KEY;
            const BKASH_APP_SECRET = ((_b = payload.cred) === null || _b === void 0 ? void 0 : _b.BKASH_APP_SECRET) || config_1.default.BKASH_APP_SECRET;
            const BKASH_USERNAME = ((_c = payload.cred) === null || _c === void 0 ? void 0 : _c.BKASH_USERNAME) || config_1.default.BKASH_USERNAME;
            const BKASH_PASSWORD = ((_d = payload.cred) === null || _d === void 0 ? void 0 : _d.BKASH_PASSWORD) || config_1.default.BKASH_PASSWORD;
            const BKASH_BASE_URL = config_1.default.BKASH_BASE_URL;
            const reqBody = {
                app_key: BKASH_APP_KEY,
                app_secret: BKASH_APP_SECRET,
            };
            try {
                const response = yield axios_1.default.post(`${BKASH_BASE_URL}${bkashApiEndpoints_1.GRAND_TOKEN}`, reqBody, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        username: BKASH_USERNAME,
                        password: BKASH_PASSWORD,
                    },
                    maxBodyLength: Infinity,
                });
                if (((_e = response === null || response === void 0 ? void 0 : response.data) === null || _e === void 0 ? void 0 : _e.statusCode) !== "0000") {
                    yield this.Model.ErrorLogsModel().insertErrorLogs({
                        http_method: 'POST',
                        level: constants_1.ERROR_LEVEL_CRITICAL,
                        message: 'Error while generating BKASH Refresh token',
                        url: bkashApiEndpoints_1.GRAND_TOKEN,
                        user_id: payload.user_id,
                        source: payload.source,
                        metadata: {
                            api: constants_1.TYPE_PAYMENT_GATEWAY_BKASH,
                            request_body: reqBody,
                            headers: {
                                'Content-Type': 'application/json',
                                Accept: 'application/json',
                                username: BKASH_USERNAME,
                                password: BKASH_PASSWORD,
                            },
                            response: response === null || response === void 0 ? void 0 : response.data,
                        },
                    });
                    throw new customError_1.default('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
                }
                const { refresh_token } = response.data;
                const authModel = this.Model.CommonModel(payload.trx);
                yield authModel.upsertPaymentGatewayToken({
                    gateway_name: constants_1.TYPE_PAYMENT_GATEWAY_BKASH,
                    key: `BKASH_TOKEN_ENV_${BKASH_USERNAME}`,
                    value: refresh_token
                });
                const cacheKey = `bkash_id_token_${BKASH_USERNAME}`;
                yield (0, redis_1.deleteRedis)(cacheKey);
                return refresh_token;
            }
            catch (error) {
                console.error('Error fetching bKash token:', error);
                yield this.Model.ErrorLogsModel().insertErrorLogs({
                    http_method: 'POST',
                    level: constants_1.ERROR_LEVEL_CRITICAL,
                    message: 'Error while generating BKASH Refresh token',
                    url: bkashApiEndpoints_1.GRAND_TOKEN,
                    user_id: payload.user_id,
                    source: payload.source,
                    metadata: {
                        api: constants_1.TYPE_PAYMENT_GATEWAY_BKASH,
                        request_body: reqBody,
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            username: BKASH_USERNAME,
                            password: BKASH_PASSWORD,
                        },
                        error: error,
                    },
                });
                throw new customError_1.default('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
            }
        });
    }
    getBkashIdTokenFromRefreshToken(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const cacheKey = `bkash_id_token_${((_a = payload.cred) === null || _a === void 0 ? void 0 : _a.BKASH_USERNAME) || config_1.default.BKASH_USERNAME}`;
            const cachedToken = yield (0, redis_1.getRedis)(cacheKey);
            const model = this.Model.CommonModel();
            if (cachedToken) {
                console.log('Using cached bKash ID token:', cachedToken);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { id_token: cachedToken },
                };
            }
            const getBkashToken = yield model.getPaymentGatewayToken({ gateway_name: constants_1.TYPE_PAYMENT_GATEWAY_BKASH, key: cacheKey });
            let refresh_token;
            if (getBkashToken.length) {
                refresh_token = getBkashToken[0].value;
            }
            else {
                refresh_token = yield this.getBkashRefreshToken(payload);
            }
            const BKASH_APP_KEY = ((_b = payload.cred) === null || _b === void 0 ? void 0 : _b.BKASH_APP_KEY) || config_1.default.BKASH_APP_KEY;
            const BKASH_APP_SECRET = ((_c = payload.cred) === null || _c === void 0 ? void 0 : _c.BKASH_APP_SECRET) || config_1.default.BKASH_APP_SECRET;
            const BKASH_USERNAME = ((_d = payload.cred) === null || _d === void 0 ? void 0 : _d.BKASH_USERNAME) || config_1.default.BKASH_USERNAME;
            const BKASH_PASSWORD = ((_e = payload.cred) === null || _e === void 0 ? void 0 : _e.BKASH_PASSWORD) || config_1.default.BKASH_PASSWORD;
            const BKASH_BASE_URL = config_1.default.BKASH_BASE_URL;
            const reqBody = {
                app_key: BKASH_APP_KEY,
                app_secret: BKASH_APP_SECRET,
                refresh_token,
            };
            try {
                let id_token;
                const response = yield axios_1.default.post(`${BKASH_BASE_URL}${bkashApiEndpoints_1.REFRESH_TOKEN}`, reqBody, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        username: BKASH_USERNAME,
                        password: BKASH_PASSWORD,
                    },
                    maxBodyLength: Infinity,
                });
                if (response.data.statusCode === "9999") { //token expired
                    const new_refresh_token = yield this.getBkashRefreshToken(payload);
                    const response = yield axios_1.default.post(`${BKASH_BASE_URL}${bkashApiEndpoints_1.REFRESH_TOKEN}`, {
                        app_key: BKASH_APP_KEY,
                        app_secret: BKASH_APP_SECRET,
                        refresh_token: new_refresh_token,
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            username: BKASH_USERNAME,
                            password: BKASH_PASSWORD,
                        },
                        maxBodyLength: Infinity,
                    });
                    if (response.data.statusCode !== '0000') {
                        yield this.Model.ErrorLogsModel().insertErrorLogs({
                            http_method: 'POST',
                            level: constants_1.ERROR_LEVEL_CRITICAL,
                            message: 'Error while generating BKASH id token',
                            url: bkashApiEndpoints_1.REFRESH_TOKEN,
                            user_id: payload.user_id,
                            source: payload.source,
                            metadata: {
                                api: constants_1.TYPE_PAYMENT_GATEWAY_BKASH,
                                request_body: {
                                    app_key: BKASH_APP_KEY,
                                    app_secret: BKASH_APP_SECRET,
                                    refresh_token: new_refresh_token,
                                },
                                headers: {
                                    'Content-Type': 'application/json',
                                    Accept: 'application/json',
                                    username: BKASH_USERNAME,
                                    password: BKASH_PASSWORD,
                                },
                                response: response === null || response === void 0 ? void 0 : response.data,
                            },
                        });
                        throw new customError_1.default('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
                    }
                    id_token = (_f = response.data) === null || _f === void 0 ? void 0 : _f.id_token;
                }
                else if (response.data.statusCode === '0000') {
                    id_token = (_g = response.data) === null || _g === void 0 ? void 0 : _g.id_token;
                }
                else {
                    yield this.Model.ErrorLogsModel().insertErrorLogs({
                        http_method: 'POST',
                        level: constants_1.ERROR_LEVEL_CRITICAL,
                        message: 'Error while generating BKASH id token',
                        url: bkashApiEndpoints_1.REFRESH_TOKEN,
                        user_id: payload.user_id,
                        source: payload.source,
                        metadata: {
                            api: constants_1.TYPE_PAYMENT_GATEWAY_BKASH,
                            request_body: reqBody,
                            headers: {
                                'Content-Type': 'application/json',
                                Accept: 'application/json',
                                username: BKASH_USERNAME,
                                password: BKASH_PASSWORD,
                            },
                            response: response === null || response === void 0 ? void 0 : response.data,
                        },
                    });
                    throw new customError_1.default('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
                }
                // Cache token for 1 hour
                yield (0, redis_1.setRedis)(cacheKey, id_token, 3600);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: { id_token },
                };
            }
            catch (error) {
                yield this.Model.ErrorLogsModel().insertErrorLogs({
                    http_method: 'POST',
                    level: constants_1.ERROR_LEVEL_CRITICAL,
                    message: 'Error while generating BKASH id token',
                    url: bkashApiEndpoints_1.REFRESH_TOKEN,
                    user_id: payload.user_id,
                    source: payload.source,
                    metadata: {
                        api: constants_1.TYPE_PAYMENT_GATEWAY_BKASH,
                        request_body: {
                            app_key: BKASH_APP_KEY,
                            app_secret: BKASH_APP_SECRET,
                            refresh_token: refresh_token,
                        },
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            username: BKASH_USERNAME,
                            password: BKASH_PASSWORD,
                        },
                        error,
                    },
                });
                throw new customError_1.default('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
            }
        });
    }
    createBkashPaymentSession(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { data: token_Data } = yield this.getBkashIdTokenFromRefreshToken({
                trx: payload.trx,
                user_id: payload.user_id,
                source: payload.source,
                cred: payload.cred
            });
            console.log({ token_Data });
            const params = new URLSearchParams({
                s_page: payload.success_page || "",
                f_page: payload.failed_page || "",
                c_page: payload.cancelled_page || "",
                ref_id: payload.ref_id || ""
            });
            const paymentBody = {
                mode: "0011",
                payerReference: payload.mobile_number,
                callbackURL: `${config_1.default.SERVER_URL}/payment/bkash?${params.toString()}`,
                amount: payload.amount.toString(),
                currency: "BDT",
                intent: "sale",
                merchantInvoiceNumber: payload.ref_id,
            };
            const BKASH_APP_KEY = ((_a = payload.cred) === null || _a === void 0 ? void 0 : _a.BKASH_APP_KEY) || config_1.default.BKASH_APP_KEY;
            const axiosConfig = {
                method: "POST",
                url: `${config_1.default.BKASH_BASE_URL}${bkashApiEndpoints_1.CREATE_PAYMENT}`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: token_Data.id_token,
                    "X-App-Key": BKASH_APP_KEY,
                },
                data: JSON.stringify(paymentBody),
            };
            try {
                const response = yield axios_1.default.request(axiosConfig);
                if (response.data.statusCode !== '0000') {
                    yield this.Model.ErrorLogsModel().insertErrorLogs({
                        http_method: 'POST',
                        level: constants_1.ERROR_LEVEL_INFO,
                        message: 'Error while generating BKASH session',
                        url: bkashApiEndpoints_1.CREATE_PAYMENT,
                        user_id: payload.user_id,
                        source: payload.source,
                        metadata: {
                            api: constants_1.TYPE_PAYMENT_GATEWAY_BKASH,
                            request_body: paymentBody,
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json",
                                Authorization: token_Data.id_token,
                                "X-App-Key": BKASH_APP_KEY,
                            },
                            response: response === null || response === void 0 ? void 0 : response.data,
                        },
                    });
                    throw new customError_1.default('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: response.data,
                    message: "Payment created successfully.",
                };
            }
            catch (error) {
                yield this.Model.ErrorLogsModel().insertErrorLogs({
                    http_method: 'POST',
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: 'Error while generating BKASH session',
                    url: bkashApiEndpoints_1.CREATE_PAYMENT,
                    user_id: payload.user_id,
                    source: payload.source,
                    metadata: {
                        api: constants_1.TYPE_PAYMENT_GATEWAY_BKASH,
                        request_body: paymentBody,
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                            Authorization: token_Data.id_token,
                            "X-App-Key": BKASH_APP_KEY,
                        },
                        error
                    },
                });
                throw new customError_1.default('Something went wrong. Please try again later', this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
            }
        });
    }
    bkashExecutePaymentAPI(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const BKASH_APP_KEY = payload.BKASH_APP_KEY || config_1.default.BKASH_APP_KEY;
            try {
                const response = yield axios_1.default.post(`${config_1.default.BKASH_BASE_URL}${bkashApiEndpoints_1.EXECUTE_PAYMENT}`, { paymentID: payload.payment_id }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: payload.id_token,
                        'X-App-Key': BKASH_APP_KEY,
                    },
                    maxBodyLength: Infinity,
                });
                return {
                    data: response.data
                };
            }
            catch (error) {
                yield this.Model.ErrorLogsModel().insertErrorLogs({
                    http_method: 'POST',
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: 'Error while executing Bkash payment API',
                    url: bkashApiEndpoints_1.EXECUTE_PAYMENT,
                    user_id: payload.user_id,
                    source: payload.source,
                    metadata: {
                        api: constants_1.TYPE_PAYMENT_GATEWAY_BKASH,
                        request_body: { paymentID: payload.payment_id },
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            Authorization: payload.id_token,
                            'X-App-Key': BKASH_APP_KEY,
                        },
                        error
                    },
                });
                return;
            }
        });
    }
    bkashQueryPaymentAPI(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const BKASH_APP_KEY = payload.BKASH_APP_KEY || config_1.default.BKASH_APP_KEY;
            try {
                const response = yield axios_1.default.post(`${config_1.default.BKASH_BASE_URL}${bkashApiEndpoints_1.QUERY_PAYMENT}`, { paymentID: payload.payment_id }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: payload.id_token,
                        'X-App-Key': BKASH_APP_KEY,
                    },
                    maxBodyLength: Infinity,
                });
                return {
                    data: response.data
                };
            }
            catch (error) {
                yield this.Model.ErrorLogsModel().insertErrorLogs({
                    http_method: 'POST',
                    level: constants_1.ERROR_LEVEL_INFO,
                    message: 'Error while Bkash query payment API',
                    url: bkashApiEndpoints_1.QUERY_PAYMENT,
                    user_id: payload.user_id,
                    source: payload.source,
                    metadata: {
                        api: constants_1.TYPE_PAYMENT_GATEWAY_BKASH,
                        request_body: { paymentID: payload.payment_id },
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            Authorization: payload.id_token,
                            'X-App-Key': BKASH_APP_KEY,
                        },
                        error
                    },
                });
                return;
            }
        });
    }
}
exports.PaymentSupportService = PaymentSupportService;
