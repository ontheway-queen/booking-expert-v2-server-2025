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
const agencyModel_1 = __importDefault(require("../../models/agentModel/agencyModel"));
const agencyPaymentModel_1 = __importDefault(require("../../models/agentModel/agencyPaymentModel"));
class BalanceLib {
    constructor(trx) {
        this.trx = trx;
    }
    AgencyBalanceAvailabilityCheck(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agency_id, price, }) {
            const agencyModel = new agencyModel_1.default(this.trx);
            const balance = yield agencyModel.getAgencyBalance(agency_id);
            const checkAgency = yield agencyModel.checkAgency({ agency_id });
            if (balance > 0) {
                if (price <= balance) {
                    return {
                        availability: true,
                        deduct: 'Balance',
                        balance: price,
                        loan: 0,
                    };
                }
                if (price <= balance + Number(checkAgency === null || checkAgency === void 0 ? void 0 : checkAgency.usable_loan)) {
                    return {
                        availability: true,
                        deduct: 'Both',
                        balance: balance,
                        loan: Number(checkAgency === null || checkAgency === void 0 ? void 0 : checkAgency.usable_loan) - price,
                    };
                }
            }
            if (price <= Number(checkAgency === null || checkAgency === void 0 ? void 0 : checkAgency.usable_loan)) {
                return {
                    availability: true,
                    deduct: 'Loan',
                    balance: 0,
                    loan: price,
                };
            }
            else {
                return { availability: false, deduct: 'Both', balance: 0, loan: 0 };
            }
        });
    }
    AgencyDeductBalance(_a) {
        return __awaiter(this, arguments, void 0, function* ({ balance, deduct, loan, remark, agency_id, voucher_no, }) {
            const agencyModel = new agencyModel_1.default(this.trx);
            const agencyPaymentModel = new agencyPaymentModel_1.default(this.trx);
            if (deduct === 'Balance') {
                yield agencyPaymentModel.insertAgencyLedger({
                    agency_id,
                    amount: balance,
                    voucher_no,
                    details: remark,
                    type: 'Debit',
                });
                return true;
            }
            if (deduct === 'Loan') {
                yield agencyPaymentModel.insertAgencyLedger({
                    agency_id,
                    amount: loan,
                    voucher_no,
                    details: remark + `(Debited from Emergency credit.)`,
                    type: 'Debit',
                });
                const checkAgency = yield agencyModel.checkAgency({ agency_id });
                yield agencyModel.updateAgency({
                    usable_loan: Number(checkAgency === null || checkAgency === void 0 ? void 0 : checkAgency.usable_loan) - loan,
                }, agency_id);
                return true;
            }
            if (deduct === 'Both') {
                yield agencyPaymentModel.insertAgencyLedger({
                    agency_id,
                    amount: loan + balance,
                    voucher_no,
                    details: remark +
                        `(${balance}/- debited from balance, ${loan}/- debited from emergency credit.)`,
                    type: 'Debit',
                });
                const checkAgency = yield agencyModel.checkAgency({ agency_id });
                yield agencyModel.updateAgency({
                    usable_loan: Number(checkAgency === null || checkAgency === void 0 ? void 0 : checkAgency.usable_loan) - loan,
                }, agency_id);
                return true;
            }
            return false;
        });
    }
}
exports.default = BalanceLib;
