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
const constants_1 = require("../../utils/miscellaneous/constants");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class UmrahBookingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertUmrahBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_booking')
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getAgentB2CUmarhBookingList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, need_total = false) {
            var _a;
            const data = yield this.db('umrah_booking AS ub')
                .withSchema(this.SERVICE_SCHEMA)
                .select('ub.id', 'ub.booking_ref', 'ub.umrah_id', 'up.title AS umrah_title', 'up.short_description AS umrah_short_description', 'ub.status', 'ub.user_id', 'abu.name AS user_name', 'ub.traveler_adult', 'ub.traveler_child', 'ub.total_price', 'ub.created_at')
                .joinRaw('agent_b2c.users AS abu ON abu.id = ub.user_id')
                .leftJoin('umrah_package AS up', 'up.id', 'ub.umrah_id')
                .where((qb) => {
                qb.where('ub.source_type', constants_1.SOURCE_AGENT_B2C).andWhere('ub.source_id', query.agency_id);
                if (query.user_id) {
                    qb.andWhere('ub.user_id', query.user_id);
                }
                if (query.status) {
                    qb.andWhere('ub.status', query.status);
                }
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween('ub.created_at', [query.from_date, query.to_date]);
                }
            })
                .limit(query.limit ? parseInt(query.limit) : constants_1.DATA_LIMIT)
                .offset(query.skip ? parseInt(query.skip) : 0);
            let total = [];
            if (need_total) {
                total = yield this.db('umrah_booking AS ub')
                    .count('* AS total')
                    .withSchema(this.SERVICE_SCHEMA)
                    .where((qb) => {
                    qb.where('ub.source_type', constants_1.SOURCE_AGENT_B2C).andWhere('ub.source_id', query.agency_id);
                    if (query.user_id) {
                        qb.andWhere('ub.user_id', query.user_id);
                    }
                    if (query.status) {
                        qb.andWhere('ub.status', query.status);
                    }
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween('ub.created_at', [
                            query.from_date,
                            query.to_date,
                        ]);
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    getSingleAgentB2CUmrahBookingDetails(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_booking AS ub')
                .select('ub.*', 'up.title AS umrah_title', 'up.short_description AS umrah_short_description', 'abu.name AS user_name')
                .joinRaw('agent_b2c.users AS abu ON abu.id = ub.user_id')
                .leftJoin('umrah_package AS up', 'up.id', 'ub.umrah_id')
                .andWhere('ub.id', query.id)
                .andWhere('ub.source_id', query.source_id)
                .andWhere('ub.source_type', constants_1.SOURCE_AGENT_B2C)
                .first();
        });
    }
    insertUmrahBookingContact(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_booking_contacts')
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getUmrahBookingContacts(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_booking_contacts')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'name', 'email', 'phone', 'address')
                .where('booking_id', bookingId)
                .first();
        });
    }
}
exports.default = UmrahBookingModel;
