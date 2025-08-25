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
exports.AgentB2CSubPaymentService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AgentB2CSubPaymentService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getDepositRequestList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const { agency_id } = req.agencyUser;
            const depositModel = this.Model.DepositRequestModel();
            const queryParams = {
                agency_id,
            };
            if (query.filter) {
                queryParams.filter = query.filter;
            }
            if (query.from_date && query.to_date) {
                queryParams.from_date = query.from_date;
            }
            if (query.user_id) {
                queryParams.created_by = query.user_id;
            }
            if (query.limit) {
                queryParams.filter = query.limit;
            }
            if (query.status !== undefined) {
                queryParams.status = query.status;
            }
            if (query.skip) {
                queryParams.filter = query.skip;
            }
            const data = yield depositModel.getAgentB2CDepositRequestList(queryParams, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    getSingleDepositRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { agency_id } = req.agencyUser;
            const depositModel = this.Model.DepositRequestModel();
            const data = yield depositModel.getSingleAgentB2CDepositRequest(Number(id), agency_id);
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data,
            };
        });
    }
    updateDepositRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { agency_id, user_id } = req.agencyUser;
                const depositModel = this.Model.DepositRequestModel(trx);
                const AgencyPaymentModel = this.Model.AgencyB2CPaymentModel(trx);
                const data = yield depositModel.getSingleAgentB2CDepositRequest(Number(id), agency_id);
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (data.status !== constants_1.DEPOSIT_STATUS_PENDING) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.REQUEST_STATUS_NOT_ALLOWED_TO_CHANGE,
                    };
                }
                const { status, note } = req.body;
                if (status === constants_1.DEPOSIT_STATUS_REJECTED) {
                    yield depositModel.updateDepositRequest({
                        status,
                        update_note: note,
                        updated_by: user_id,
                        updated_at: new Date(),
                    }, Number(id));
                }
                else if (status === constants_1.DEPOSIT_STATUS_APPROVED) {
                    yield depositModel.updateDepositRequest({
                        status,
                        update_note: note,
                        updated_by: user_id,
                        updated_at: new Date(),
                    }, Number(id));
                    yield AgencyPaymentModel.insertLedger({
                        agency_id: agency_id,
                        user_id: data.created_by,
                        amount: data.amount,
                        voucher_no: data.request_no,
                        type: 'Credit',
                        details: `Deposit request - ${data.request_no} has been approved.`,
                        ledger_date: new Date(),
                    });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: `Deposit request has been updated`,
                };
            }));
        });
    }
    getLedger(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const _a = req.query, { user_id } = _a, restQuery = __rest(_a, ["user_id"]);
            const AgencyB2CPaymentModel = this.Model.AgencyB2CPaymentModel();
            const data = yield AgencyB2CPaymentModel.getLedger(Object.assign(Object.assign({ agency_id }, restQuery), { user_id: Number(user_id) }), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data.data,
                total: data.total || 0,
            };
        });
    }
    balanceAdjust(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agencyUser;
                const { amount, type, details, voucher_no, payment_date, user_id } = req.body;
                const AgencyB2CPaymentModel = this.Model.AgencyB2CPaymentModel(trx);
                const checkVoucher = yield AgencyB2CPaymentModel.getLedger({
                    voucher_no,
                    agency_id,
                    user_id,
                });
                if (checkVoucher.data.length > 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'Voucher No already exists',
                    };
                }
                yield AgencyB2CPaymentModel.insertLedger({
                    agency_id,
                    amount,
                    details,
                    type,
                    user_id,
                    voucher_no,
                    ledger_date: payment_date,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Balance adjusted successfully',
                };
            }));
        });
    }
}
exports.AgentB2CSubPaymentService = AgentB2CSubPaymentService;
