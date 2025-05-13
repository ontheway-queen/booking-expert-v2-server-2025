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
exports.AgentPaymentsService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const paymentSupport_service_1 = require("../../../utils/supportServices/paymentSupportServices/paymentSupport.service");
class AgentPaymentsService extends abstract_service_1.default {
    getLoanHistory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const restQuery = req.query;
            const AgencyPaymentModel = this.Model.AgencyPaymentModel();
            const data = yield AgencyPaymentModel.getLoanHistory(Object.assign({ agency_id }, restQuery), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data.data,
                total: data.total || 0,
            };
        });
    }
    getLedger(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const restQuery = req.query;
            const AgencyPaymentModel = this.Model.AgencyPaymentModel();
            const data = yield AgencyPaymentModel.getAgencyLedger(Object.assign({ agency_id }, restQuery));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data.data,
                total: data.total || 0,
            };
        });
    }
    createDepositRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id, agency_id } = req.agencyUser;
                const paymentModel = this.Model.AgencyPaymentModel(trx);
                const check_duplicate = yield paymentModel.getDepositRequestList({ agency_id, status: constants_1.DEPOSIT_STATUS_PENDING });
                if (!check_duplicate.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Your previous deposit request is still in pending. New deposit request cannot be made"
                    };
                }
                const body = req.body;
                const request_no = yield lib_1.default.generateNo({ trx, type: constants_1.GENERATE_AUTO_UNIQUE_ID.agent_deposit_request });
                const files = req.files || [];
                let docs = "";
                files.forEach((file) => {
                    switch (file.fieldname) {
                        case 'docs':
                            docs = file.filename;
                            break;
                        default:
                            throw new customError_1.default('Invalid files. Please provide valid docs', this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                });
                const deposit_body = Object.assign(Object.assign({ request_no,
                    agency_id }, body), { docs, created_by: user_id });
                const res = yield paymentModel.createDepositRequest(deposit_body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Deposit request has been created",
                    data: {
                        id: res[0].id
                    }
                };
            }));
        });
    }
    getCurrentDepositRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const paymentModel = this.Model.AgencyPaymentModel(trx);
                const getCurrentDepositData = yield paymentModel.getDepositRequestList({ agency_id, status: constants_1.DEPOSIT_STATUS_PENDING, limit: 1 }, false);
                if (!getCurrentDepositData.data.length) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        data: []
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: getCurrentDepositData.data[0]
                };
            }));
        });
    }
    cancelCurrentDepositRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const paymentModel = this.Model.AgencyPaymentModel(trx);
                const getCurrentDepositData = yield paymentModel.getDepositRequestList({ agency_id, status: constants_1.DEPOSIT_STATUS_PENDING, limit: 1 }, false);
                if (!getCurrentDepositData.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "No Pending deposit request has been found!"
                    };
                }
                ;
                yield paymentModel.updateDepositRequest({ status: constants_1.DEPOSIT_STATUS_CANCELLED }, getCurrentDepositData.data[0].id);
                return {
                    success: false,
                    code: this.StatusCode.HTTP_OK,
                    message: "Deposit request has been cancelled"
                };
            }));
        });
    }
    getDepositHistory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const paymentModel = this.Model.AgencyPaymentModel(trx);
                const query = req.query;
                const depositData = yield paymentModel.getDepositRequestList(Object.assign(Object.assign({}, query), { agency_id }), true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    count: depositData.total,
                    data: depositData.data
                };
            }));
        });
    }
    topUpUsingPaymentGateway(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id, name, user_email, phone_number } = req.agencyUser;
                const body = req.body;
                const { amount, currency, payment_gateway, success_page, failed_page, cancelled_page, is_app } = req.body;
                const paymentService = new paymentSupport_service_1.PaymentSupportService();
                switch (payment_gateway) {
                    case constants_1.PAYMENT_GATEWAYS.SSL:
                        return yield paymentService.SSLPaymentGateway({
                            total_amount: amount,
                            currency,
                            tran_id: `${constants_1.SOURCE_AGENT}-${agency_id}-${user_id}`,
                            cus_name: name,
                            cus_email: user_email,
                            cus_phone: phone_number,
                            product_name: 'credit load',
                            success_page,
                            failed_page,
                            cancelled_page,
                        });
                    default:
                        return {
                            success: false,
                            message: 'Invalid bank',
                            redirectUrl: null,
                            code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        };
                }
            }));
        });
    }
    getADMList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const admModel = this.Model.ADMManagementModel(trx);
                const query = req.query;
                const data = yield admModel.getADMManagementList(Object.assign(Object.assign({}, query), { agency_id, adm_for: constants_1.SOURCE_AGENT }), true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: data.total,
                    data: data.data
                };
            }));
        });
    }
}
exports.AgentPaymentsService = AgentPaymentsService;
