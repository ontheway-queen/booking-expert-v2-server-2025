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
exports.AdminAccountsService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class AdminAccountsService extends abstract_service_1.default {
    constructor() {
        super();
    }
    getAccounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, filter, status } = req.query;
            const configModel = this.Model.OthersModel();
            const { data, total } = yield configModel.getAccount({
                source_type: constants_1.SOURCE_ADMIN,
                limit,
                skip,
                filter,
                status,
            }, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    updateAccounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { user_id } = req.admin;
                const configModel = this.Model.OthersModel(trx);
                const { id } = req.params;
                const account_id = Number(id);
                const account = yield configModel.checkAccount({
                    source_type: constants_1.SOURCE_ADMIN,
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
                yield configModel.updateAccount({ id: account_id, source_type: constants_1.SOURCE_ADMIN }, payload);
                yield this.insertAdminAudit(trx, {
                    created_by: user_id,
                    details: 'Updated Account data.',
                    payload: JSON.stringify(payload),
                    type: 'UPDATE',
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
                const { user_id } = req.admin;
                const OtersModel = this.Model.OthersModel(trx);
                const CommonModel = this.Model.CommonModel(trx);
                const body = req.body;
                const checkBank = yield CommonModel.getBanks({
                    id: body.bank_id,
                    status: true,
                });
                if (!checkBank.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'Bank not found.',
                    };
                }
                const account = yield OtersModel.createAccount(Object.assign(Object.assign({}, body), { source_type: constants_1.SOURCE_ADMIN }));
                yield this.insertAdminAudit(trx, {
                    created_by: user_id,
                    details: 'New Account created.',
                    payload: JSON.stringify(Object.assign(Object.assign({}, body), { bank: checkBank.data[0].name })),
                    type: 'CREATE',
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        id: account[0].id,
                    },
                };
            }));
        });
    }
    deleteAccounts(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user_id } = req.admin;
            const OthersModel = this.Model.OthersModel();
            const { id } = req.params;
            const account_id = Number(id);
            const account = yield OthersModel.checkAccount({
                source_type: constants_1.SOURCE_ADMIN,
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
                source_type: constants_1.SOURCE_ADMIN,
            });
            yield this.insertAdminAudit(undefined, {
                created_by: user_id,
                details: `Account ${account.account_name}(${account.bank_name})[${account.account_number}] is deleted.`,
                type: 'DELETE',
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
}
exports.AdminAccountsService = AdminAccountsService;
