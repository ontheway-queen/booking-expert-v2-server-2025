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
exports.PublicPaymentService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../../config/config"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const paymentSupport_service_1 = require("../../../utils/supportServices/paymentSupportServices/paymentSupport.service");
class PublicPaymentService extends abstract_service_1.default {
    transactionUsingSSL(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                let { s_page = '', f_page = '', page = '', status = '', } = req.query;
                const body = req.body;
                const { tran_id } = req.body;
                const formatted_order_id = tran_id.split('-');
                switch (status) {
                    case 'success':
                        if (formatted_order_id[0] === constants_1.SOURCE_AGENT) {
                            if (formatted_order_id.length !== 3) {
                                //AGENT-AgencyID-UserID
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: 'Transaction id is not valid',
                                    redirect_url: decodeURIComponent(f_page),
                                };
                            }
                            //verify tran id from ssl
                            const session = yield axios_1.default.post(`${config_1.default.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body === null || body === void 0 ? void 0 : body.val_id}&store_id=${config_1.default.SSL_STORE_ID}&store_passwd=${config_1.default.SSL_STORE_PASSWORD}&format=json`);
                            if (!['VALID', 'VALIDATED'].includes((_a = session === null || session === void 0 ? void 0 : session.data) === null || _a === void 0 ? void 0 : _a.status)) {
                                return {
                                    success: true,
                                    code: this.StatusCode.HTTP_OK,
                                    message: 'Unverified transaction',
                                    redirect_url: decodeURIComponent(f_page),
                                };
                            }
                            //load credit
                            const paymentModel = this.Model.AgencyPaymentModel(trx);
                            yield paymentModel.insertAgencyLedger({
                                agency_id: formatted_order_id[1],
                                type: 'Credit',
                                amount: session.data.store_amount,
                                details: 'Credit has been loaded using SSL',
                                voucher_no: yield lib_1.default.generateNo({
                                    trx,
                                    type: constants_1.GENERATE_AUTO_UNIQUE_ID.agent_deposit_request,
                                }),
                            });
                            //audit trail
                            const agencyModel = this.Model.AgencyModel(trx);
                            yield agencyModel.createAudit({
                                agency_id: formatted_order_id[1],
                                created_by: formatted_order_id[2],
                                type: 'CREATE',
                                details: `Credit has been loaded using SSL amount ${session.data.store_amount}`,
                            });
                            return {
                                success: true,
                                code: this.StatusCode.HTTP_OK,
                                message: 'Payment success',
                                redirect_url: `${decodeURIComponent(s_page)}&date=${session.data.tran_date}&amount=${session.data.store_amount}&currency=${session.data.currency}&transaction_id=${session.data.bank_tran_id}&payment_method=${session.data.card_issuer}&card_type=${session.data.card_type}&card_brand=${session.data.card_brand}`,
                            };
                        }
                        else if (formatted_order_id[0] === constants_1.SOURCE_AGENT_B2C) {
                            if (formatted_order_id.length !== 3) {
                                //AGENT B2C-AgencyID-UserID
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: 'Transaction id is not valid',
                                    redirect_url: decodeURIComponent(f_page),
                                };
                            }
                            //get SSL cred
                            const othersModel = this.Model.OthersModel(trx);
                            const SSL_STORE_ID = yield othersModel.getPaymentGatewayCreds({ agency_id: formatted_order_id[1], gateway_name: 'SSL', key: 'SSL_STORE_ID' });
                            if (!SSL_STORE_ID || !SSL_STORE_ID.length) {
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: 'Payment gateway is not configured. Please contact with support team.',
                                    redirect_url: decodeURIComponent(f_page),
                                };
                            }
                            const SSL_STORE_PASSWORD = yield othersModel.getPaymentGatewayCreds({ agency_id: formatted_order_id[1], gateway_name: 'SSL', key: 'SSL_STORE_PASSWORD' });
                            if (!SSL_STORE_PASSWORD || !SSL_STORE_PASSWORD.length) {
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: 'Payment gateway is not configured. Please contact with support team.',
                                    redirect_url: decodeURIComponent(f_page),
                                };
                            }
                            //verify tran id from ssl
                            const session = yield axios_1.default.post(`${config_1.default.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body === null || body === void 0 ? void 0 : body.val_id}&store_id=${(_b = SSL_STORE_ID === null || SSL_STORE_ID === void 0 ? void 0 : SSL_STORE_ID[0]) === null || _b === void 0 ? void 0 : _b.value}&store_passwd=${(_c = SSL_STORE_PASSWORD === null || SSL_STORE_PASSWORD === void 0 ? void 0 : SSL_STORE_PASSWORD[0]) === null || _c === void 0 ? void 0 : _c.value}&format=json`);
                            if (!['VALID', 'VALIDATED'].includes((_d = session === null || session === void 0 ? void 0 : session.data) === null || _d === void 0 ? void 0 : _d.status)) {
                                return {
                                    success: true,
                                    code: this.StatusCode.HTTP_OK,
                                    message: 'Unverified transaction',
                                    redirect_url: decodeURIComponent(f_page),
                                };
                            }
                            //load credit
                            const paymentModel = this.Model.AgencyB2CPaymentModel(trx);
                            yield paymentModel.insertLedger({
                                agency_id: formatted_order_id[1],
                                user_id: formatted_order_id[2],
                                amount: session.data.store_amount,
                                type: 'Credit',
                                details: 'Credit has been loaded using SSL',
                                voucher_no: yield lib_1.default.generateNo({
                                    trx,
                                    type: constants_1.GENERATE_AUTO_UNIQUE_ID.b2c_deposit_request,
                                }),
                                ledger_date: new Date(),
                            });
                            return {
                                success: true,
                                code: this.StatusCode.HTTP_OK,
                                message: 'Payment success',
                                redirect_url: `${decodeURIComponent(s_page)}&date=${session.data.tran_date}&amount=${session.data.store_amount}&currency=${session.data.currency}&transaction_id=${session.data.bank_tran_id}&payment_method=${session.data.card_issuer}&card_type=${session.data.card_type}&card_brand=${session.data.card_brand}`,
                            };
                        }
                    case 'failed':
                        if (formatted_order_id[0] === constants_1.SOURCE_AGENT) {
                            if (formatted_order_id.length !== 3) {
                                //AGENT-AgencyID-UserID
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: 'Transaction id is not valid',
                                    redirect_url: decodeURIComponent(page),
                                };
                            }
                            //audit trail
                            const agencyModel = this.Model.AgencyModel(trx);
                            yield agencyModel.createAudit({
                                agency_id: formatted_order_id[1],
                                created_by: formatted_order_id[2],
                                type: 'CREATE',
                                details: `credit load has been failed using SSL`,
                            });
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: 'Transaction has been failed. Please try again later!',
                                redirect_url: decodeURIComponent(page),
                            };
                        }
                    case 'cancelled':
                        if (formatted_order_id[0] === constants_1.SOURCE_AGENT) {
                            if (formatted_order_id.length !== 3) {
                                //AGENT-AgencyID-UserID
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: 'Transaction id is not valid',
                                    redirect_url: decodeURIComponent(page),
                                };
                            }
                            //audit trail
                            const agencyModel = this.Model.AgencyModel(trx);
                            yield agencyModel.createAudit({
                                agency_id: formatted_order_id[1],
                                created_by: formatted_order_id[2],
                                type: 'CREATE',
                                details: `credit load has been cancelled using SSL`,
                            });
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: 'Transaction has been cancelled',
                                redirect_url: decodeURIComponent(page),
                            };
                        }
                    default:
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: this.ResMsg.HTTP_BAD_REQUEST,
                        };
                }
            }));
        });
    }
    transactionUsingBkash(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f;
                let { s_page, f_page, c_page, status, paymentID, ref_id } = req.query;
                if (!paymentID || !status) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Transaction has been failed. Please try again later!',
                        redirect_url: decodeURIComponent(f_page),
                    };
                }
                const formatted_order_id = ref_id.split('-');
                const paymentSupportService = new paymentSupport_service_1.PaymentSupportService();
                switch (status) {
                    case 'success':
                        if (formatted_order_id[0] === constants_1.SOURCE_AGENT) {
                            if (formatted_order_id.length !== 4) {
                                //AGENT-AgencyID-UserID
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: 'Transaction id is not valid',
                                    redirect_url: decodeURIComponent(f_page),
                                };
                            }
                            const { data: token_Data } = yield paymentSupportService.getBkashIdTokenFromRefreshToken({
                                trx,
                                user_id: Number(formatted_order_id[2]),
                                source: formatted_order_id[0]
                            });
                            const executePaymentResponse = yield paymentSupportService.bkashExecutePaymentAPI({
                                id_token: token_Data.id_token,
                                payment_id: paymentID,
                                user_id: Number(formatted_order_id[2]),
                                source: formatted_order_id[0]
                            });
                            const executePayment = executePaymentResponse === null || executePaymentResponse === void 0 ? void 0 : executePaymentResponse.data;
                            if (executePayment) {
                                if ((executePayment === null || executePayment === void 0 ? void 0 : executePayment.statusCode) === '0000') {
                                    const actual_amount = parseFloat(lib_1.default.calculateAdjustedAmount(executePayment.amount, constants_1.BKASH_PERCENTAGE, 'subtract').toFixed(2));
                                    //load credit
                                    const paymentModel = this.Model.AgencyPaymentModel(trx);
                                    yield paymentModel.insertAgencyLedger({
                                        agency_id: Number(formatted_order_id[1]),
                                        type: 'Credit',
                                        amount: actual_amount,
                                        details: 'Credit has been loaded using BKASH',
                                        voucher_no: yield lib_1.default.generateNo({
                                            trx,
                                            type: constants_1.GENERATE_AUTO_UNIQUE_ID.agent_deposit_request,
                                        }),
                                    });
                                    //audit trail
                                    const agencyModel = this.Model.AgencyModel(trx);
                                    yield agencyModel.createAudit({
                                        agency_id: Number(formatted_order_id[1]),
                                        created_by: Number(formatted_order_id[2]),
                                        type: 'CREATE',
                                        details: `Credit has been loaded using BKASH - amount ${actual_amount}`,
                                    });
                                    return {
                                        success: true,
                                        code: this.StatusCode.HTTP_OK,
                                        message: 'Payment success',
                                        redirect_url: `${decodeURIComponent(s_page)}&date=${executePayment.paymentExecuteTime}&amount=${actual_amount}&currency=BDT
                    }&transaction_id=${executePayment.trxID}&payment_method=BKASH`,
                                    };
                                }
                                else {
                                    return {
                                        success: false,
                                        code: this.StatusCode.HTTP_BAD_REQUEST,
                                        message: 'Payment has been failed',
                                        redirect_url: decodeURIComponent(f_page),
                                    };
                                }
                            }
                            else {
                                const queryPaymentResponse = yield paymentSupportService.bkashQueryPaymentAPI({
                                    id_token: token_Data.id_token,
                                    payment_id: paymentID,
                                    user_id: Number(formatted_order_id[2]),
                                    source: formatted_order_id[0]
                                });
                                const query_payment_data = queryPaymentResponse === null || queryPaymentResponse === void 0 ? void 0 : queryPaymentResponse.data;
                                if ((query_payment_data === null || query_payment_data === void 0 ? void 0 : query_payment_data.statusCode) === '0000') {
                                    const actual_amount = parseFloat(lib_1.default.calculateAdjustedAmount(query_payment_data.amount, constants_1.BKASH_PERCENTAGE, 'subtract').toFixed(2));
                                    //load credit
                                    const paymentModel = this.Model.AgencyPaymentModel(trx);
                                    yield paymentModel.insertAgencyLedger({
                                        agency_id: Number(formatted_order_id[1]),
                                        type: 'Credit',
                                        amount: actual_amount,
                                        details: 'Credit has been loaded using BKASH',
                                        voucher_no: yield lib_1.default.generateNo({
                                            trx,
                                            type: constants_1.GENERATE_AUTO_UNIQUE_ID.agent_deposit_request,
                                        }),
                                    });
                                    //audit trail
                                    const agencyModel = this.Model.AgencyModel(trx);
                                    yield agencyModel.createAudit({
                                        agency_id: Number(formatted_order_id[1]),
                                        created_by: Number(formatted_order_id[2]),
                                        type: 'CREATE',
                                        details: `Credit has been loaded using BKASH - amount ${actual_amount}`,
                                    });
                                    return {
                                        success: true,
                                        code: this.StatusCode.HTTP_OK,
                                        message: 'Payment success',
                                        redirect_url: `${decodeURIComponent(s_page)}&date=${query_payment_data.paymentExecuteTime}&amount=${actual_amount}&currency=BDT
                    }&transaction_id=${query_payment_data.trxID}&payment_method=BKASH`,
                                    };
                                }
                                else {
                                    return {
                                        success: false,
                                        code: this.StatusCode.HTTP_BAD_REQUEST,
                                        message: 'Payment has been failed',
                                        redirect_url: decodeURIComponent(f_page),
                                    };
                                }
                            }
                        }
                        else if (formatted_order_id[0] === 'AGENT_B2C') {
                            if (formatted_order_id.length !== 4) {
                                //AGENT B2C-AgencyID-UserID
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: 'Transaction id is not valid',
                                    redirect_url: decodeURIComponent(f_page),
                                };
                            }
                            //get BKASH Cred
                            const othersModel = this.Model.OthersModel(trx);
                            const BKASH_APP_KEY = yield othersModel.getPaymentGatewayCreds({ agency_id: Number(formatted_order_id[1]), gateway_name: 'BKASH', key: 'BKASH_APP_KEY' });
                            if (!BKASH_APP_KEY || !BKASH_APP_KEY.length) {
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: 'Payment gateway is not configured. Please contact with support team.',
                                    redirect_url: decodeURIComponent(f_page),
                                };
                            }
                            const BKASH_APP_SECRET = yield othersModel.getPaymentGatewayCreds({ agency_id: Number(formatted_order_id[1]), gateway_name: 'BKASH', key: 'BKASH_APP_SECRET' });
                            if (!BKASH_APP_SECRET || !BKASH_APP_SECRET.length) {
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: 'Payment gateway is not configured. Please contact with support team.',
                                    redirect_url: decodeURIComponent(f_page),
                                };
                            }
                            const BKASH_USERNAME = yield othersModel.getPaymentGatewayCreds({ agency_id: Number(formatted_order_id[1]), gateway_name: 'BKASH', key: 'BKASH_USERNAME' });
                            if (!BKASH_USERNAME || !BKASH_USERNAME.length) {
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: 'Payment gateway is not configured. Please contact with support team.',
                                    redirect_url: decodeURIComponent(f_page),
                                };
                            }
                            const BKASH_PASSWORD = yield othersModel.getPaymentGatewayCreds({ agency_id: Number(formatted_order_id[1]), gateway_name: 'BKASH', key: 'BKASH_PASSWORD' });
                            if (!BKASH_PASSWORD || !BKASH_PASSWORD.length) {
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: 'Payment gateway is not configured. Please contact with support team.',
                                    redirect_url: decodeURIComponent(f_page),
                                };
                            }
                            const { data: token_Data } = yield paymentSupportService.getBkashIdTokenFromRefreshToken({
                                trx,
                                user_id: Number(formatted_order_id[2]),
                                source: constants_1.SOURCE_AGENT_B2C,
                                cred: {
                                    BKASH_APP_KEY: (_a = BKASH_APP_KEY === null || BKASH_APP_KEY === void 0 ? void 0 : BKASH_APP_KEY[0]) === null || _a === void 0 ? void 0 : _a.value,
                                    BKASH_APP_SECRET: (_b = BKASH_APP_SECRET === null || BKASH_APP_SECRET === void 0 ? void 0 : BKASH_APP_SECRET[0]) === null || _b === void 0 ? void 0 : _b.value,
                                    BKASH_USERNAME: (_c = BKASH_USERNAME === null || BKASH_USERNAME === void 0 ? void 0 : BKASH_USERNAME[0]) === null || _c === void 0 ? void 0 : _c.value,
                                    BKASH_PASSWORD: (_d = BKASH_PASSWORD === null || BKASH_PASSWORD === void 0 ? void 0 : BKASH_PASSWORD[0]) === null || _d === void 0 ? void 0 : _d.value
                                }
                            });
                            const executePaymentResponse = yield paymentSupportService.bkashExecutePaymentAPI({
                                id_token: token_Data.id_token,
                                payment_id: paymentID,
                                user_id: Number(formatted_order_id[2]),
                                source: constants_1.SOURCE_AGENT_B2C,
                                BKASH_APP_KEY: (_e = BKASH_APP_KEY === null || BKASH_APP_KEY === void 0 ? void 0 : BKASH_APP_KEY[0]) === null || _e === void 0 ? void 0 : _e.value
                            });
                            const executePayment = executePaymentResponse === null || executePaymentResponse === void 0 ? void 0 : executePaymentResponse.data;
                            if (executePayment) {
                                if ((executePayment === null || executePayment === void 0 ? void 0 : executePayment.statusCode) === '0000') {
                                    const actual_amount = parseFloat(lib_1.default.calculateAdjustedAmount(executePayment.amount, constants_1.BKASH_PERCENTAGE, 'subtract').toFixed(2));
                                    //load credit
                                    const paymentModel = this.Model.AgencyB2CPaymentModel(trx);
                                    yield paymentModel.insertLedger({
                                        agency_id: Number(formatted_order_id[1]),
                                        user_id: Number(formatted_order_id[2]),
                                        type: 'Credit',
                                        amount: actual_amount,
                                        details: 'Credit has been loaded using BKASH',
                                        voucher_no: yield lib_1.default.generateNo({
                                            trx,
                                            type: constants_1.GENERATE_AUTO_UNIQUE_ID.b2c_deposit_request,
                                        }),
                                        ledger_date: new Date()
                                    });
                                    return {
                                        success: true,
                                        code: this.StatusCode.HTTP_OK,
                                        message: 'Payment success',
                                        redirect_url: `${decodeURIComponent(s_page)}&date=${executePayment.paymentExecuteTime}&amount=${actual_amount}&currency=BDT
                    }&transaction_id=${executePayment.trxID}&payment_method=BKASH`,
                                    };
                                }
                                else {
                                    return {
                                        success: false,
                                        code: this.StatusCode.HTTP_BAD_REQUEST,
                                        message: 'Payment has been failed',
                                        redirect_url: decodeURIComponent(f_page),
                                    };
                                }
                            }
                            else {
                                const queryPaymentResponse = yield paymentSupportService.bkashQueryPaymentAPI({
                                    id_token: token_Data.id_token,
                                    payment_id: paymentID,
                                    user_id: Number(formatted_order_id[2]),
                                    source: constants_1.SOURCE_AGENT_B2C,
                                    BKASH_APP_KEY: (_f = BKASH_APP_KEY === null || BKASH_APP_KEY === void 0 ? void 0 : BKASH_APP_KEY[0]) === null || _f === void 0 ? void 0 : _f.value
                                });
                                const query_payment_data = queryPaymentResponse === null || queryPaymentResponse === void 0 ? void 0 : queryPaymentResponse.data;
                                console.log({ query_payment_data });
                                if ((query_payment_data === null || query_payment_data === void 0 ? void 0 : query_payment_data.statusCode) === '0000') {
                                    const actual_amount = parseFloat(lib_1.default.calculateAdjustedAmount(query_payment_data.amount, constants_1.BKASH_PERCENTAGE, 'subtract').toFixed(2));
                                    //load credit
                                    const paymentModel = this.Model.AgencyB2CPaymentModel(trx);
                                    yield paymentModel.insertLedger({
                                        agency_id: Number(formatted_order_id[1]),
                                        user_id: Number(formatted_order_id[2]),
                                        type: 'Credit',
                                        amount: actual_amount,
                                        details: 'Credit has been loaded using BKASH',
                                        voucher_no: yield lib_1.default.generateNo({
                                            trx,
                                            type: constants_1.GENERATE_AUTO_UNIQUE_ID.b2c_deposit_request,
                                        }),
                                        ledger_date: new Date(),
                                    });
                                    return {
                                        success: true,
                                        code: this.StatusCode.HTTP_OK,
                                        message: 'Payment success',
                                        redirect_url: `${decodeURIComponent(s_page)}&date=${query_payment_data.paymentExecuteTime}&amount=${actual_amount}&currency=BDT
                    }&transaction_id=${query_payment_data.trxID}&payment_method=BKASH`,
                                    };
                                }
                                else {
                                    return {
                                        success: false,
                                        code: this.StatusCode.HTTP_BAD_REQUEST,
                                        message: 'Payment has been failed',
                                        redirect_url: decodeURIComponent(f_page),
                                    };
                                }
                            }
                        }
                    case 'cancel':
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Transaction has been cancelled!',
                            redirect_url: decodeURIComponent(c_page),
                        };
                    case 'failure':
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'Transaction has been failed. Please try again later!',
                            redirect_url: decodeURIComponent(f_page),
                        };
                    default:
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: this.ResMsg.HTTP_BAD_REQUEST,
                        };
                }
            }));
        });
    }
}
exports.PublicPaymentService = PublicPaymentService;
