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
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class AdminDynamicFareService extends abstract_service_1.default {
    // ------------------ Dynamic Fare Supplier ------------------
    createSupplier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const model = this.Model.DynamicFareModel(trx);
                const check_entry = yield model.getDynamicFareSuppliers({
                    set_id: req.body.set_id,
                    supplier_id: req.body.supplier_id,
                });
                if (check_entry.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'This supplier already exists for this set',
                    };
                }
                const res = yield model.createDynamicFareSupplier(req.body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Supplier created',
                    data: { id: (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id },
                };
            }));
        });
    }
    getSuppliers(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { set_id } = req.query;
            const model = this.Model.DynamicFareModel();
            const data = yield model.getDynamicFareSuppliers({
                set_id: Number(set_id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateSupplier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { id } = req.params;
            const existing = yield model.getDynamicFareSupplierById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.updateDynamicFareSupplier(Number(id), req.body);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Supplier updated',
            };
        });
    }
    deleteSupplier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { id } = req.params;
            const existing = yield model.getDynamicFareSupplierById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.deleteDynamicFareSupplier(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Supplier deleted',
            };
        });
    }
    // ------------------ Supplier Airlines Dynamic Fare ------------------
    createSupplierAirlinesFare(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.DynamicFareModel(trx);
                const { body } = req.body;
                const payload = [];
                for (const elm of body) {
                    const checkDynamic = yield model.getDynamicFareSupplierById(elm.dynamic_fare_supplier_id);
                    if (checkDynamic.length) {
                        const airlineCodes = elm.airline
                            .split(',')
                            .map((code) => code.trim().toUpperCase());
                        for (const code of airlineCodes) {
                            payload.push(Object.assign(Object.assign({}, elm), { airline: code }));
                        }
                    }
                }
                if (!payload.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: 'Dynamic fare supplier id not found.',
                    };
                }
                yield model.createSupplierAirlinesFare(payload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Supplier airline fare created',
                };
            }));
        });
    }
    getSupplierAirlinesFares(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { dynamic_fare_supplier_id } = req.query;
            const model = this.Model.DynamicFareModel();
            const data = yield model.getSupplierAirlinesFares({
                dynamic_fare_supplier_id: Number(dynamic_fare_supplier_id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateSupplierAirlinesFare(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { id } = req.params;
            const existing = yield model.getSupplierAirlinesFareById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.updateSupplierAirlinesFare(Number(id), req.body);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Supplier airline fare updated',
            };
        });
    }
    deleteSupplierAirlinesFare(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { id } = req.params;
            const existing = yield model.getSupplierAirlinesFareById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.deleteSupplierAirlinesFare(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Supplier airline fare deleted',
            };
        });
    }
    // ------------------ Dynamic Fare Tax ------------------
    createFareTax(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.DynamicFareModel(trx);
                const { body } = req.body;
                for (const elm of body) {
                    const airlineCodes = elm.airline
                        .split(',')
                        .map((code) => code.trim().toUpperCase());
                    for (const code of airlineCodes) {
                        const check_duplicate = yield model.getFareTaxes({
                            dynamic_fare_supplier_id: elm.dynamic_fare_supplier_id,
                            airline: code,
                            tax_name: elm.tax_name,
                        });
                        if (check_duplicate.length) {
                            throw new customError_1.default(`This tax (${elm.tax_name}) already exists for airline (${code})`, this.StatusCode.HTTP_CONFLICT);
                        }
                        yield model.createFareTax(Object.assign(Object.assign({}, elm), { airline: code }));
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Fare tax created',
                };
            }));
        });
    }
    getFareTaxes(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { dynamic_fare_supplier_id } = req.query;
            const model = this.Model.DynamicFareModel();
            const data = yield model.getFareTaxes({
                dynamic_fare_supplier_id: Number(dynamic_fare_supplier_id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateFareTax(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { id } = req.params;
            const existing = yield model.getFareTaxById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.updateFareTax(Number(id), req.body);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Fare tax updated',
            };
        });
    }
    deleteFareTax(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { id } = req.params;
            const existing = yield model.getFareTaxById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.deleteFareTax(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Fare tax deleted',
            };
        });
    }
}
exports.default = AdminDynamicFareService;
