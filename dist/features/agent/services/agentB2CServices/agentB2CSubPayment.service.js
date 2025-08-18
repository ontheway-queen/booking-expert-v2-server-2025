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
                const { agency_id } = req.agencyUser;
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
                const { status } = req.body;
                if (status === constants_1.DEPOSIT_STATUS_REJECTED) {
                    yield depositModel.updateDepositRequest({ status }, Number(id));
                }
                else if (status === constants_1.DEPOSIT_STATUS_APPROVED) {
                    yield depositModel.updateDepositRequest({ status }, Number(id));
                    yield AgencyPaymentModel.insertLedger({
                        agency_id: agency_id,
                        user_id: data.created_by,
                        amount: data.amount,
                        voucher_no: data.request_no,
                        type: 'Credit',
                        details: `Deposit request - ${data.request_no} has been approved.`,
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
}
exports.AgentB2CSubPaymentService = AgentB2CSubPaymentService;
