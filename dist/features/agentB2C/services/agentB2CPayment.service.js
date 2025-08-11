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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
class AgentB2CPaymentService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Get invoice
    getInvoices(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id, user_id } = req.agencyB2CUser;
            const invoiceModel = this.Model.InvoiceModel();
            const query = req.query;
            const data = yield invoiceModel.getInvoiceList(Object.assign({ source_type: constants_1.SOURCE_AGENT_B2C, source_id: agency_id, user_id }, query), true);
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
                const { agency_id, user_id } = req.agencyB2CUser;
                const invoiceModel = this.Model.InvoiceModel(trx);
                const { id } = req.params;
                const data = yield invoiceModel.getSingleInvoice({
                    id: Number(id),
                    source_id: agency_id,
                    source_type: constants_1.SOURCE_AGENT_B2C,
                    user_id,
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
                    source_type: constants_1.SOURCE_AGENT_B2C,
                    user_id,
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
                const agencyModel = this.Model.AgencyB2CPaymentModel(trx);
                const check_balance = yield agencyModel.getUserBalance(agency_id, user_id);
                if (check_balance < data.due) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'There is insufficient balance in your account.',
                    };
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
    // Create deposit req
    createDepositRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id, agency_id } = req.agencyUser;
                const paymentModel = this.Model.AgencyPaymentModel(trx);
                const othersModel = this.Model.OthersModel(trx);
                const check_duplicate = yield paymentModel.getDepositRequestList({
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
                    source_type: 'ADMIN',
                });
                const request_no = yield lib_1.default.generateNo({
                    trx,
                    type: GENERATE_AUTO_UNIQUE_ID.agent_deposit_request,
                });
                const files = req.files || [];
                let docs = '';
                files.forEach((file) => {
                    switch (file.fieldname) {
                        case 'docs':
                            docs = file.filename;
                            break;
                        default:
                            throw new CustomError('Invalid files. Please provide valid docs', this.StatusCode.HTTP_UNPROCESSABLE_ENTITY);
                    }
                });
                const deposit_body = Object.assign(Object.assign({ request_no,
                    agency_id }, body), { docs, created_by: user_id });
                const res = yield paymentModel.createDepositRequest(deposit_body);
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
    // Get Deposit req
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
                        data: [],
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: getCurrentDepositData.data[0],
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
                        message: 'No Pending deposit request has been found!',
                    };
                }
                yield paymentModel.updateDepositRequest({ status: DEPOSIT_STATUS_CANCELLED }, getCurrentDepositData.data[0].id);
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
                const paymentModel = this.Model.AgencyPaymentModel(trx);
                const query = req.query;
                const depositData = yield paymentModel.getDepositRequestList(Object.assign(Object.assign({}, query), { agency_id }), true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: depositData.total,
                    data: depositData.data,
                };
            }));
        });
    }
    // Get ledger
    getLedger(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.agencyB2CUser;
            const { agency_id } = req.agencyB2CWhiteLabel;
            const restQuery = req.query;
            const AgencyB2CPaymentModel = this.Model.AgencyB2CPaymentModel();
            const data = yield AgencyB2CPaymentModel.getLedger(Object.assign({ agency_id,
                user_id }, restQuery), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data.data,
                total: data.total || 0,
            };
        });
    }
}
exports.default = AgentB2CPaymentService;
