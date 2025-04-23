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
}
exports.default = AdminAgentPaymentsService;
