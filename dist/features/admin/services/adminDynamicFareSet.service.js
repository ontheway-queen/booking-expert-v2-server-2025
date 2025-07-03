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
class AdminDynamicFareSetService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { name } = req.body;
                const { user_id: created_by } = req.admin;
                const model = this.Model.DynamicFareSetModel(trx);
                const check_duplicate = yield model.checkDynamicFareSet({
                    type: constants_1.SET_TYPE_FLIGHT,
                    name,
                });
                if (check_duplicate) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'Set already exists with this name',
                    };
                }
                const res = yield model.createDynamicFareSet({
                    name,
                    created_by,
                    type: constants_1.SET_TYPE_FLIGHT,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Dynamic fare set has been created',
                    data: { id: (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id },
                };
            }));
        });
    }
    getSets(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareSetModel();
            const data = yield model.getAllDynamicFareSet({ type: constants_1.SET_TYPE_FLIGHT });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareSetModel();
            const { id } = req.params;
            const body = req.body;
            const existing = yield model.checkDynamicFareSet({
                type: constants_1.SET_TYPE_FLIGHT,
                id: Number(id),
            });
            if (!existing) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            if (body.name) {
                const check_duplicate = yield model.checkDynamicFareSet({
                    name: body.name,
                    type: constants_1.SET_TYPE_FLIGHT,
                });
                if (check_duplicate) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'Set already exists with this name',
                    };
                }
            }
            yield model.updateDynamicFareSet(body, {
                id: Number(id),
                type: constants_1.SET_TYPE_FLIGHT,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Dynamic fare set updated',
            };
        });
    }
    deleteSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.DynamicFareSetModel(trx);
                const { id } = req.params;
                const existing = yield model.checkDynamicFareSet({
                    type: constants_1.SET_TYPE_FLIGHT,
                    id: Number(id),
                });
                if (!existing) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const checkUsage = yield model.checkUsages({
                    id: Number(id),
                    type: constants_1.SET_TYPE_FLIGHT,
                });
                if (checkUsage) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'This set is already used for agencies. To continue update sets of the agencies.',
                    };
                }
                yield model.updateDynamicFareSet({ is_deleted: true }, { id: Number(id), type: constants_1.SET_TYPE_FLIGHT });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Dynamic fare set deleted',
                };
            }));
        });
    }
    getSupplierList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const data = yield model.getSupplierList();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
}
exports.default = AdminDynamicFareSetService;
