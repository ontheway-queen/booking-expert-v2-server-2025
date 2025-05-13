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
class PaymentSupportService extends abstract_service_1.default {
    SSLPaymentGateway(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const ssl_body = Object.assign(Object.assign({}, payload), { store_id: config_1.default.SSL_STORE_ID, store_passwd: config_1.default.SSL_STORE_PASSWORD, success_url: `${config_1.default.SERVER_URL}/payment/ssl?status=success&s_page=${payload.success_page}&f_page=${payload.failed_page}`, fail_url: `${config_1.default.SERVER_URL}/payment/ssl?status=failed&page=${payload.failed_page}`, cancel_url: `${config_1.default.SERVER_URL}/payment/ssl?status=cancelled&page=${payload.cancelled_page}`, shipping_method: "no", product_category: "General", product_profile: "General", cus_add1: 'Dhaka', cus_city: 'Dhaka', cus_country: 'Bangladesh' });
                const response = yield axios_1.default.post(`${config_1.default.SSL_URL}/gwprocess/v4/api.php`, qs_1.default.stringify(ssl_body), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                if (((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.status) === "SUCCESS") {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        redirect_url: response.data.redirectGatewayURL
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: "Something went wrong!"
                    };
                }
            }
            catch (err) {
                console.log('SSL ERROR', err);
                return {
                    success: false,
                    code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: "Something went wrong"
                };
            }
        });
    }
}
exports.PaymentSupportService = PaymentSupportService;
