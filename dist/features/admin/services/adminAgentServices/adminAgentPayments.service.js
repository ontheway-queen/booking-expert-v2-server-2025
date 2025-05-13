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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
const lib_1 = __importDefault(require("../../../../utils/lib/lib"));
class AdminAgentPaymentsService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createLoan(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const { agency_id, amount, type, details } = req.body;
                const AgencyModel = this.Model.AgencyModel(trx);
                const AgencyPaymentModel = this.Model.AgencyPaymentModel(trx);
                const checkAgency = yield AgencyModel.checkAgency({
                    agency_id,
                    status: 'Active',
                });
                if (!checkAgency) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'Agency is not eligible for loan.',
                    };
                }
                const payload = {};
                if (type === 'Given') {
                    payload.usable_loan = Number(checkAgency.usable_loan) + amount;
                }
                else {
                    payload.usable_loan = Number(checkAgency.usable_loan) - amount;
                }
                yield AgencyModel.updateAgency(payload, agency_id);
                yield AgencyPaymentModel.insertLoanHistory({
                    agency_id,
                    amount,
                    created_by: user_id,
                    details,
                    type,
                });
                yield this.insertAdminAudit(trx, {
                    created_by: user_id,
                    type: 'CREATE',
                    details: `${type} loan /-${amount}. Agency: ${checkAgency.agency_name}(${checkAgency.agent_no})`,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    loanHistory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const _a = req.query, { agency_id } = _a, restQuery = __rest(_a, ["agency_id"]);
            const AgencyPaymentModel = this.Model.AgencyPaymentModel();
            const data = yield AgencyPaymentModel.getLoanHistory(Object.assign({ agency_id: Number(agency_id) }, restQuery), true);
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
            const _a = req.query, { agency_id } = _a, restQuery = __rest(_a, ["agency_id"]);
            const AgencyPaymentModel = this.Model.AgencyPaymentModel();
            const data = yield AgencyPaymentModel.getAgencyLedger(Object.assign({ agency_id: Number(agency_id) }, restQuery));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data.data,
                total: data.total || 0,
            };
        });
    }
    getDepositRequestList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const depositModel = this.Model.AgencyPaymentModel();
            const data = yield depositModel.getDepositRequestList(query, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data
            };
        });
    }
    getSingleDepositRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const depositModel = this.Model.AgencyPaymentModel();
            const data = yield depositModel.getSingleDepositRequest(Number(id));
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data
            };
        });
    }
    updateDepositRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const depositModel = this.Model.AgencyPaymentModel(trx);
                const data = yield depositModel.getSingleDepositRequest(Number(id));
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
                if (data.status !== constants_1.DEPOSIT_STATUS_PENDING) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.REQUEST_STATUS_NOT_ALLOWED_TO_CHANGE
                    };
                }
                const { status } = req.body;
                if (status === constants_1.DEPOSIT_STATUS_REJECTED) {
                    yield depositModel.updateDepositRequest({ status }, Number(id));
                }
                else if (status === constants_1.DEPOSIT_STATUS_APPROVED) {
                    yield depositModel.updateDepositRequest({ status }, Number(id));
                    yield depositModel.insertAgencyLedger({
                        agency_id: data.agency_id,
                        amount: data.amount,
                        voucher_no: data.request_no,
                        type: "Credit",
                        details: `Deposit request - ${data.request_no} has been approved.`
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: `Deposit request has been updated`
                };
            }));
        });
    }
    adjustBalance(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const body = req.body;
                const paymentModel = this.Model.AgencyPaymentModel(trx);
                const voucher_no = yield lib_1.default.generateNo({ trx, type: constants_1.GENERATE_AUTO_UNIQUE_ID.agent_deposit_request });
                const ledger_body = Object.assign({ voucher_no }, body);
                const res = yield paymentModel.insertAgencyLedger(ledger_body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Agency Balance has been updated",
                    data: {
                        id: res[0].id,
                        voucher_no
                    }
                };
            }));
        });
    }
    createADM(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const admModel = this.Model.ADMManagementModel(trx);
                const flightBookingModel = this.Model.FlightBookingModel(trx);
                const agentPaymentModel = this.Model.AgencyPaymentModel(trx);
                const { booking_id, amount, note } = req.body;
                //get booking
                const getBooking = yield flightBookingModel.getSingleFlightBooking({ id: Number(booking_id), booked_by: constants_1.SOURCE_AGENT });
                if (!getBooking) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "No booking has been found with this ID"
                    };
                }
                ;
                //create ADM
                const ref_no = yield lib_1.default.generateNo({ trx, type: constants_1.GENERATE_AUTO_UNIQUE_ID.adm_management });
                const adm_body = {
                    ref_no,
                    booking_id,
                    source_type: constants_1.SOURCE_AGENT,
                    source_id: getBooking.source_id,
                    amount,
                    note,
                    created_by: user_id
                };
                yield admModel.createADMManagement(adm_body);
                //Create Transaction (DEBIT)
                yield agentPaymentModel.insertAgencyLedger({
                    agency_id: Number(getBooking.source_id),
                    amount,
                    type: "Debit",
                    voucher_no: ref_no,
                    details: `An ADM charge has been applied for booking - ${getBooking.booking_ref}`
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "New data has been created for ADM Management"
                };
            }));
        });
    }
    getADMList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const query = req.query;
                const admModel = this.Model.ADMManagementModel(trx);
                const data = yield admModel.getADMManagementList(Object.assign(Object.assign({}, query), { adm_for: constants_1.SOURCE_AGENT }), true);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: data.total,
                    data: data.data
                };
            }));
        });
    }
    getSingleADM(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const admModel = this.Model.ADMManagementModel(trx);
                const data = yield admModel.getSingleADMManagementData({ id: Number(id), adm_for: constants_1.SOURCE_AGENT });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data
                };
            }));
        });
    }
    updateADM(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const admModel = this.Model.ADMManagementModel(trx);
                const data = yield admModel.getSingleADMManagementData({ id: Number(id), adm_for: constants_1.SOURCE_AGENT });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
                const body = req.body;
                yield admModel.updateADMmanagement(body, Number(id));
                if (body.amount && (Number(body.amount) !== Number(data.amount))) {
                    const paymentModel = this.Model.AgencyPaymentModel(trx);
                    const getLedger = yield paymentModel.getAgencyLedger({ voucher_no: data.ref_no });
                    if (getLedger.data.length) {
                        yield paymentModel.updateAgencyLedgerByVoucherNo({
                            amount: body.amount,
                            details: getLedger.data[0].details + `. ADM Amount has been updated from ${data.amount}/= to ${body.amount}`
                        }, data.ref_no);
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "ADM has been updated"
                };
            }));
        });
    }
    deleteADM(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const admModel = this.Model.ADMManagementModel(trx);
                const data = yield admModel.getSingleADMManagementData({ id: Number(id), adm_for: constants_1.SOURCE_AGENT });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
                yield admModel.deleteADMmanagement(Number(id));
                const paymentModel = this.Model.AgencyPaymentModel(trx);
                const getLedger = yield paymentModel.getAgencyLedger({ voucher_no: data.ref_no });
                if (getLedger.data.length) {
                    yield paymentModel.deleteAgencyLedgerByVoucherNo(data.ref_no);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "ADM has been deleted"
                };
            }));
        });
    }
}
exports.default = AdminAgentPaymentsService;
