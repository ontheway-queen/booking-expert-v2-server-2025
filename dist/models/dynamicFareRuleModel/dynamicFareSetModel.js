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
class DynamicFareSetModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createDynamicFareSet(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('dynamic_fare_set')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getAllDynamicFareSet(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('dynamic_fare_set')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                if (query.filter) {
                    qb.andWhereILike('name', `%${query.filter}%`);
                }
                if (query.check_name) {
                    qb.andWhere('name', query.check_name);
                }
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
                if (query.type) {
                    qb.andWhere('type', query.type);
                }
            })
                .andWhere('is_deleted', false);
            return data;
        });
    }
    getSingleDynamicFareSet(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, status, type, }) {
            return yield this.db('dynamic_fare_set AS ms')
                .withSchema(this.DBO_SCHEMA)
                .select('ms.*', 'cua.name AS created_by_name', 'uua.name AS updated_by_name')
                .joinRaw(`left join admin.user_admin AS cua on ms.created_by = cua.id`)
                .joinRaw(`left join admin.user_admin AS uua on ms.updated_by = uua.id`)
                .where((qb) => {
                if (type) {
                    qb.andWhere('ms.type', type);
                }
                qb.andWhere('ms.id', id);
                if (status !== undefined) {
                    qb.andWhere('ms.status', status);
                }
            })
                .andWhere('ms.is_deleted', false)
                .first();
        });
    }
    checkDynamicFareSet(_a) {
        return __awaiter(this, arguments, void 0, function* ({ name, type, status, id, }) {
            return yield this.db('dynamic_fare_set')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                if (name) {
                    qb.andWhere('name', name);
                }
                if (id) {
                    qb.andWhere('id', id);
                }
                qb.andWhere('type', type);
                if (status !== undefined) {
                    qb.andWhere('status', status);
                }
            })
                .andWhere('is_deleted', false)
                .first();
        });
    }
    updateDynamicFareSet(payload_1, _a) {
        return __awaiter(this, arguments, void 0, function* (payload, { id, type }) {
            return yield this.db('dynamic_fare_set')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .andWhere({ id })
                .andWhere({ type });
        });
    }
    checkUsages(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, type, }) {
            const checkFromAgency = yield this.db('agency')
                .withSchema(this.AGENT_SCHEMA)
                .select('*')
                .where((qb) => {
                if (type === 'Flight') {
                    qb.andWhere('flight_markup_set', id);
                }
                if (type === 'Hotel') {
                    qb.andWhere('hotel_markup_set', id);
                }
            });
            if (checkFromAgency.length) {
                return true;
            }
            else {
                const checkB2C = yield this.db('b2c_markup_config')
                    .withSchema(this.DBO_SCHEMA)
                    .select('*')
                    .andWhere('type', type)
                    .andWhere('markup_set_id', id);
                if (checkB2C.length) {
                    return true;
                }
                else {
                    false;
                }
            }
        });
    }
}
exports.default = DynamicFareSetModel;
