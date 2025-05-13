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
class PublicPaymentService extends abstract_service_1.default {
    transactionUsingSSL(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                let { s_page = '', f_page = '', page = '', status = '' } = req.query;
                const body = req.body;
                const { tran_id } = req.body;
                const formatted_order_id = tran_id.split("-");
                switch (status) {
                    case 'success':
                        if (formatted_order_id[0] === constants_1.SOURCE_AGENT) {
                            if (formatted_order_id.length !== 3) { //AGENT-AgencyID-UserID
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: "Transaction id is not valid",
                                    redirect_url: decodeURIComponent(f_page)
                                };
                            }
                            //verify tran id from ssl
                            const session = yield axios_1.default.post(`${config_1.default.SSL_URL}/validator/api/validationserverAPI.php?val_id=${body === null || body === void 0 ? void 0 : body.val_id}&store_id=${config_1.default.SSL_STORE_ID}&store_passwd=${config_1.default.SSL_STORE_PASSWORD}&format=json`);
                            if (!['VALID', 'VALIDATED'].includes((_a = session === null || session === void 0 ? void 0 : session.data) === null || _a === void 0 ? void 0 : _a.status)) {
                                return {
                                    success: true,
                                    code: this.StatusCode.HTTP_OK,
                                    message: 'Unverified transaction',
                                    redirect_url: decodeURIComponent(f_page)
                                };
                            }
                            //load credit
                            const paymentModel = this.Model.AgencyPaymentModel(trx);
                            yield paymentModel.insertAgencyLedger({
                                agency_id: formatted_order_id[1],
                                type: 'Credit',
                                amount: session.data.store_amount,
                                details: 'Credit has been loaded using SSL',
                                voucher_no: yield lib_1.default.generateNo({ trx, type: constants_1.GENERATE_AUTO_UNIQUE_ID.agent_deposit_request })
                            });
                            //audit trail
                            const agencyModel = this.Model.AgencyModel(trx);
                            yield agencyModel.createAudit({
                                agency_id: formatted_order_id[1],
                                created_by: formatted_order_id[2],
                                type: "CREATE",
                                details: `credit has been loaded using SSL amount ${session.data.store_amount}`
                            });
                            return {
                                success: true,
                                code: this.StatusCode.HTTP_OK,
                                message: "Payment success",
                                redirect_url: `${decodeURIComponent(s_page)}?date=${session.data.tran_date}&amount=${session.data.store_amount}&currency=${session.data.currency}&transaction_id=${session.data.bank_tran_id}&payment_method=${session.data.card_issuer}&card_type=${session.data.card_type}&card_brand=${session.data.card_brand}`
                            };
                        }
                    case 'failed':
                        if (formatted_order_id[0] === constants_1.SOURCE_AGENT) {
                            if (formatted_order_id.length !== 3) { //AGENT-AgencyID-UserID
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: "Transaction id is not valid",
                                    redirect_url: decodeURIComponent(page)
                                };
                            }
                            //audit trail
                            const agencyModel = this.Model.AgencyModel(trx);
                            yield agencyModel.createAudit({
                                agency_id: formatted_order_id[1],
                                created_by: formatted_order_id[2],
                                type: "CREATE",
                                details: `credit load has been failed using SSL`
                            });
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: "Transaction has been failed. Please try again later!",
                                redirect_url: decodeURIComponent(page)
                            };
                        }
                    case 'cancelled':
                        if (formatted_order_id[0] === constants_1.SOURCE_AGENT) {
                            if (formatted_order_id.length !== 3) { //AGENT-AgencyID-UserID
                                return {
                                    success: false,
                                    code: this.StatusCode.HTTP_BAD_REQUEST,
                                    message: "Transaction id is not valid",
                                    redirect_url: decodeURIComponent(page)
                                };
                            }
                            //audit trail
                            const agencyModel = this.Model.AgencyModel(trx);
                            yield agencyModel.createAudit({
                                agency_id: formatted_order_id[1],
                                created_by: formatted_order_id[2],
                                type: "CREATE",
                                details: `credit load has been cancelled using SSL`
                            });
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: "Transaction has been cancelled",
                                redirect_url: decodeURIComponent(page)
                            };
                        }
                    default:
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: this.ResMsg.HTTP_BAD_REQUEST
                        };
                }
            }));
        });
    }
}
exports.PublicPaymentService = PublicPaymentService;
