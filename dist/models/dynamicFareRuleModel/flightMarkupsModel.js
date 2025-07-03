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
class FlightMarkupsModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createFlightMarkups(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_markups')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getAllFlightMarkups(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db('flight_markups as fm')
                .withSchema(this.DBO_SCHEMA)
                .select('fm.id as key', 'fm.airline', 'airlines.name AS airline_name', 'airlines.logo AS airline_logo', 'fm.markup_domestic', 'fm.markup_from_dac', 'fm.markup_to_dac', 'fm.markup_soto', 'fm.markup_type', 'fm.markup_mode', 'fm.status', 'fm.booking_block', 'fm.issue_block', 'cad.name AS created_by', 'uad.name AS updated_by', 'fm.updated_at as last_updated_at', 'fa.api_name', 'fa.api_logo')
                .joinRaw('left join ?? on ?? = ??', [
                `${this.ADMIN_SCHEMA}.user_admin AS cad`,
                'fm.created_by',
                'cad.id',
            ])
                .joinRaw('left join ?? on ?? = ??', [
                `${this.ADMIN_SCHEMA}.user_admin AS uad`,
                'fm.updated_by',
                'uad.id',
            ])
                .leftJoin('set_flight_api_view AS fa', 'fm.markup_set_flight_api_id', 'fa.id')
                .joinRaw('left join ?? on ?? = ??', [
                `${this.PUBLIC_SCHEMA}.airlines`,
                'fm.airline',
                'airlines.code',
            ])
                .where((qb) => {
                if (query.api_status) {
                    qb.andWhere('fa.status', query.api_status);
                }
                if (query.markup_set_flight_api_id) {
                    qb.andWhere('fm.markup_set_flight_api_id', query.markup_set_flight_api_id);
                }
                if (query.airline) {
                    qb.andWhere('fm.airline', query.airline);
                }
                if (query.status !== undefined) {
                    qb.andWhere('fm.status', query.status);
                }
            })
                .limit(query.limit ? Number(query.limit) : 100)
                .offset(query.skip ? Number(query.skip) : 0);
            let total = [];
            if (is_total) {
                total = yield this.db('flight_markups as fm')
                    .withSchema(this.DBO_SCHEMA)
                    .count('fm.id as total')
                    .leftJoin('flight_api AS fa', 'fm.markup_set_flight_api_id', 'fa.id')
                    .where((qb) => {
                    if (query.api_status) {
                        qb.andWhere('fa.status', query.api_status);
                    }
                    if (query.markup_set_flight_api_id) {
                        qb.andWhere('fm.markup_set_flight_api_id', query.markup_set_flight_api_id);
                    }
                    if (query.airline) {
                        qb.andWhere('fm.airline', query.airline);
                    }
                    if (query.status !== undefined) {
                        qb.andWhere('fm.status', query.status);
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    getAPIActiveAirlines(markup_set_flight_api_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_markups')
                .withSchema(this.DBO_SCHEMA)
                .select('airline as Code')
                .where({ markup_set_flight_api_id })
                .andWhere({ status: true });
        });
    }
    updateFlightMarkups(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_markups')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteFlightMarkups(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_markups')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where((qb) => {
                if (typeof id === 'number') {
                    qb.andWhere('id', id);
                }
                else {
                    qb.whereIn('id', id);
                }
            });
        });
    }
}
exports.default = FlightMarkupsModel;
