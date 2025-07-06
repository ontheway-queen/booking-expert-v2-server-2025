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
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class DynamicFareModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // Dynamic Fare Supplier
    createDynamicFareSupplier(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_supplier')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    updateDynamicFareSupplier(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_supplier')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteDynamicFareSupplier(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_supplier')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    getDynamicFareSuppliers(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { set_id, supplier_id, status } = payload;
            return yield this.db('dynamic_fare_supplier as dfs')
                .withSchema(this.DBO_SCHEMA)
                .select('dfs.*', 'sup.name AS sup_name', 'sup.api AS sup_api', 'sup.pcc AS sup_pcc', 'sup.logo AS sup_logo')
                .leftJoin('flight_supplier AS sup', 'sup.id', 'dfs.supplier_id')
                .where((qb) => {
                if (set_id) {
                    qb.andWhere({ set_id });
                }
                if (supplier_id) {
                    qb.andWhere({ supplier_id });
                }
                if (status !== undefined) {
                    qb.andWhere('dfs.status', status);
                }
                if (payload.id) {
                    qb.andWhere('dfs.id', payload.id);
                }
                if (payload.api_name) {
                    qb.andWhere('supplier.api', payload.api_name);
                }
            })
                .orderBy('dfs.id', 'desc');
        });
    }
    getDynamicFareSupplierById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_supplier')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where({ id });
        });
    }
    // Supplier Airlines Dynamic Fare
    createSupplierAirlinesFare(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('supplier_airlines_dynamic_fare')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    updateSupplierAirlinesFare(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('supplier_airlines_dynamic_fare')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteSupplierAirlinesFare(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('supplier_airlines_dynamic_fare')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    getSupplierAirlinesFares(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('supplier_airlines_dynamic_fare')
                .withSchema(this.DBO_SCHEMA)
                .select('supplier_airlines_dynamic_fare.*', 'airlines.name as airline_name', 'airlines.logo as airline_logo')
                .joinRaw(`
      LEFT JOIN airlines 
      ON airlines.code = supplier_airlines_dynamic_fare.airline
    `)
                .where((qb) => {
                qb.andWhere('dynamic_fare_supplier_id', query.dynamic_fare_supplier_id);
                if (query.airline) {
                    qb.andWhere('supplier_airlines_dynamic_fare.airline', query.airline);
                }
                if (query.flight_class) {
                    qb.andWhere('supplier_airlines_dynamic_fare.flight_class', query.flight_class);
                }
                if (query.from_dac !== undefined) {
                    qb.andWhere('from_dac', query.from_dac);
                }
                if (query.to_dac !== undefined) {
                    qb.andWhere('to_dac', query.to_dac);
                }
                if (query.soto !== undefined) {
                    qb.andWhere('soto', query.soto);
                }
                if (query.domestic !== undefined) {
                    qb.andWhere('domestic', query.domestic);
                }
            })
                .orderBy('supplier_airlines_dynamic_fare.id', 'desc');
        });
    }
    getSupplierAirlinesFareById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('supplier_airlines_dynamic_fare')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where({ id });
        });
    }
    // Dynamic Fare Tax
    createFareTax(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_tax')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    updateFareTax(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_tax')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteFareTax(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_tax')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    getFareTaxes(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_tax')
                .withSchema(this.DBO_SCHEMA)
                .select('dynamic_fare_tax.*', 'airlines.name as airline_name', 'airlines.logo as airline_logo')
                .joinRaw(`
      LEFT JOIN airlines 
      ON airlines.code = dynamic_fare_tax.airline
    `)
                .where((qb) => {
                qb.andWhere('dynamic_fare_supplier_id', query.dynamic_fare_supplier_id);
                if (query.airline) {
                    qb.andWhere('dynamic_fare_tax.airline', query.airline);
                }
                if (query.tax_name) {
                    qb.andWhere('tax_name', query.tax_name);
                }
            })
                .orderBy('dynamic_fare_tax.id', 'desc');
        });
    }
    getFareTaxById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_tax')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where({ id });
        });
    }
    //get supplier list
    getSupplierList(type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_supplier')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                if (type) {
                    qb.andWhere({ type });
                }
            });
        });
    }
}
exports.default = DynamicFareModel;
