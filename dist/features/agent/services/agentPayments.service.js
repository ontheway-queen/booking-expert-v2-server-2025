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
            const data = yield AgencyPaymentModel.getAgencyLedger(Object.assign({ agency_id }, restQuery), true);
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
                const depositRequestModel = this.Model.DepositRequestModel(trx);
                const othersModel = this.Model.OthersModel(trx);
                const check_duplicate = yield depositRequestModel.getAgentDepositRequestList({
                    agency_id,
                    status: constants_1.DEPOSIT_STATUS_PENDING,
                });
                if (check_duplicate.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Your previous deposit request is still in pending. New deposit request cannot be made',
                    };
                }
                const body = req.body;
                const checkAccount = yield othersModel.checkAccount({
                    id: body.account_id,
                    source_type: constants_1.SOURCE_ADMIN,
                });
                if (!checkAccount) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: 'Invalid account id.',
                    };
                }
                const request_no = yield lib_1.default.generateNo({
                    trx,
                    type: constants_1.GENERATE_AUTO_UNIQUE_ID.agent_deposit_request,
                });
                const files = req.files || [];
                let docs = '';
                files.forEach((file) => {
                    switch (file.fieldname) {
                        case 'document':
                            docs = file.filename;
                            break;
                        default:
                            throw new customError_1.default('Invalid files. Please provide valid document', this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                });
                const deposit_body = {
                    request_no,
                    agency_id,
                    docs,
                    created_by: user_id,
                    account_id: body.account_id,
                    amount: body.amount,
                    payment_date: body.payment_date,
                    source: constants_1.SOURCE_AGENT,
                    remarks: body.remarks,
                };
                const res = yield depositRequestModel.createDepositRequest(deposit_body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Deposit request has been created',
                    data: {
                        id: res[0].id,
                    },
                };
            }));
        });
    }
    cancelCurrentDepositRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, name, username } = req.agencyUser;
                const paymentModel = this.Model.DepositRequestModel(trx);
                const getCurrentDepositData = yield paymentModel.getAgentDepositRequestList({ agency_id, status: constants_1.DEPOSIT_STATUS_PENDING, limit: 1 }, false);
                if (!getCurrentDepositData.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'No Pending deposit request has been found!',
                    };
                }
                yield paymentModel.updateDepositRequest({
                    status: constants_1.DEPOSIT_STATUS_CANCELLED,
                    update_note: 'Deposit Cancelled by agent.' + `(${name}[${username}])`,
                }, getCurrentDepositData.data[0].id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Deposit request has been cancelled',
                };
            }));
        });
    }
    getDepositHistory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const paymentModel = this.Model.DepositRequestModel(trx);
                const query = req.query;
                const depositData = yield paymentModel.getAgentDepositRequestList(Object.assign(Object.assign({}, query), { agency_id }), true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: depositData.total,
                    data: depositData.data,
                };
            }));
        });
    }
    getSingleDepositReq(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const id = Number(req.params.id);
                const paymentModel = this.Model.DepositRequestModel(trx);
                const depositData = yield paymentModel.getSingleAgentDepositRequest(id, agency_id);
                if (!depositData) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: depositData,
                };
            }));
        });
    }
    topUpUsingPaymentGateway(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id, name, user_email, phone_number } = req.agencyUser;
                const { amount, currency, payment_gateway, success_page, failed_page, cancelled_page, is_app, } = req.body;
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
                    data: data.data,
                };
            }));
        });
    }
    getInvoices(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const invoiceModel = this.Model.InvoiceModel();
            const query = req.query;
            const data = yield invoiceModel.getInvoiceList(Object.assign({ source_type: constants_1.SOURCE_AGENT, source_id: agency_id }, query), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    getSingleInvoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const invoiceModel = this.Model.InvoiceModel(trx);
                const { id } = req.params;
                const data = yield invoiceModel.getSingleInvoice({
                    id: Number(id),
                    source_id: agency_id,
                    source_type: constants_1.SOURCE_AGENT,
                });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const MoneyReceiptModel = this.Model.MoneyReceiptModel(trx);
                const money_receipt = yield MoneyReceiptModel.getMoneyReceiptList({
                    invoice_id: Number(id),
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: Object.assign(Object.assign({}, data), { money_receipt: money_receipt.data }),
                };
            }));
        });
    }
    clearDueOfInvoice(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const invoiceModel = this.Model.InvoiceModel(trx);
                const { id } = req.params;
                const data = yield invoiceModel.getSingleInvoice({
                    id: Number(id),
                    source_id: agency_id,
                    source_type: constants_1.SOURCE_AGENT,
                });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (data.due <= 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'No due has been found with this invoice',
                    };
                }
                let balance_trans = data.due;
                let loan_trans = 0;
                //check balance
                const agencyModel = this.Model.AgencyModel(trx);
                const check_balance = yield agencyModel.getAgencyBalance(agency_id);
                if (check_balance < data.due) {
                    const agency_details = yield agencyModel.getSingleAgency({
                        id: agency_id,
                        type: constants_1.SOURCE_AGENT,
                    });
                    const usable_loan_balance = Number(agency_details === null || agency_details === void 0 ? void 0 : agency_details.usable_loan);
                    if (check_balance + usable_loan_balance < data.due) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: 'There is insufficient balance in your account.',
                        };
                    }
                    loan_trans =
                        Number(usable_loan_balance) -
                            (Number(data.due) - Number(check_balance));
                    balance_trans = check_balance;
                }
                if (loan_trans !== 0) {
                    yield agencyModel.updateAgency({ usable_loan: loan_trans }, agency_id);
                }
                const moneyReceiptModel = this.Model.MoneyReceiptModel(trx);
                yield invoiceModel.updateInvoice({ due: 0 }, Number(id));
                yield moneyReceiptModel.createMoneyReceipt({
                    mr_no: yield lib_1.default.generateNo({ trx, type: 'Money_Receipt' }),
                    invoice_id: Number(id),
                    amount: data.due,
                    user_id,
                    details: `Due has been cleared. Balance Transaction: ${balance_trans}. Loan Transaction: ${loan_trans}`,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Due has been cleared',
                };
            }));
        });
    }
    getPartialPaymentList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const invoiceModel = this.Model.InvoiceModel();
            const query = req.query;
            const data = yield invoiceModel.getInvoiceList(Object.assign(Object.assign({ source_type: constants_1.SOURCE_AGENT, source_id: agency_id }, query), { partial_payment: true }), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    getAgentBalance(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const model = this.Model.AgencyModel(trx);
                const available_balance = yield model.getAgencyBalance(agency_id);
                const usable_loan = yield model.checkAgency({ agency_id });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: {
                        available_balance,
                        usable_load: usable_loan === null || usable_loan === void 0 ? void 0 : usable_loan.usable_loan,
                    },
                };
            }));
        });
    }
    getAccounts(_req) {
        return __awaiter(this, void 0, void 0, function* () {
            const configModel = this.Model.OthersModel();
            const accounts = yield configModel.getAccount({
                source_type: 'ADMIN',
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: accounts,
            };
        });
    }
}
exports.AgentPaymentsService = AgentPaymentsService;
