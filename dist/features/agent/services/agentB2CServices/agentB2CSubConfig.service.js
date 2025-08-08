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
exports.AgentB2CSubConfigService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
class AgentB2CSubConfigService extends abstract_service_1.default {
    getB2CMarkup(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const model = this.Model.AgencyModel();
            const data = yield model.getAgentB2CMarkup(agency_id);
            if (!data) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "No markup has been set for B2C",
                    data: {},
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    upsertB2CMarkup(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id, user_id } = req.agencyUser;
            const model = this.Model.AgencyModel();
            const data = yield model.getAgentB2CMarkup(agency_id);
            if (data) {
                yield model.updateAgentB2CMarkup(req.body, agency_id);
            }
            else {
                yield model.createAgentB2CMarkup(Object.assign({ agency_id }, req.body));
            }
            yield this.insertAgentAudit(undefined, {
                agency_id,
                created_by: user_id,
                details: "Updated/Inserted B2C markup.",
                payload: JSON.stringify(req.body),
                type: "UPDATE",
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Markup has been updated for B2C",
            };
        });
    }
    getAccounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyB2CUser;
            const configModel = this.Model.OthersModel();
            const accounts = yield configModel.getAccount({
                source_type: "AGENT",
                source_id: agency_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: accounts,
            };
        });
    }
    updateAccounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyB2CUser;
                const configModel = this.Model.OthersModel(trx);
                const { id } = req.params;
                const account_id = Number(id);
                const account = yield configModel.checkAccount({
                    source_type: "AGENT",
                    source_id: agency_id,
                    id: account_id,
                });
                const payload = req.body;
                if (!account || !Object.keys(payload).length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                yield configModel.updateAccount({ id: account_id, source_type: "AGENT", source_id: agency_id }, payload);
                yield this.insertAgentAudit(trx, {
                    agency_id,
                    created_by: user_id,
                    details: "Updated Account data.",
                    payload: JSON.stringify(payload),
                    type: "UPDATE",
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
    createAccounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyB2CUser;
                const OtersModel = this.Model.OthersModel(trx);
                const CommonModel = this.Model.CommonModel(trx);
                const body = req.body;
                const checkBank = yield CommonModel.getBanks({ id: body.bank_id });
                if (!checkBank.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Bank not found.",
                    };
                }
                yield OtersModel.createAccount(body);
                yield this.insertAgentAudit(undefined, {
                    agency_id,
                    created_by: user_id,
                    details: "New Account created.",
                    payload: JSON.stringify(Object.assign(Object.assign({}, body), { bank: checkBank[0].name })),
                    type: "CREATE",
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    deleteAccounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id, user_id } = req.agencyB2CUser;
            const OthersModel = this.Model.OthersModel();
            const { id } = req.params;
            const account_id = Number(id);
            const account = yield OthersModel.checkAccount({
                source_type: "AGENT",
                source_id: agency_id,
                id: account_id,
            });
            if (!account) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield OthersModel.deleteAccount({
                id: account_id,
                source_type: "AGENT",
                source_id: agency_id,
            });
            yield this.insertAgentAudit(undefined, {
                agency_id,
                created_by: user_id,
                details: `Account ${account.account_name}(${account.bank_name})[${account.account_number}] is deleted.`,
                type: "DELETE",
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
}
exports.AgentB2CSubConfigService = AgentB2CSubConfigService;
