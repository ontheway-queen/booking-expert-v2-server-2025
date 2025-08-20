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
class HotelBookingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertHotelBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_booking')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    updateHotelBooking(payload, conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_booking')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where(conditions);
        });
    }
    insertHotelBookingTraveler(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_booking_traveler')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    insertHotelBookingCancellation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_booking_cancellation_charge')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    getHotelBooking(_a) {
        return __awaiter(this, arguments, void 0, function* ({ source_type, filter, from_date, source_id, to_date, limit, skip, user_id, }, need_total = false) {
            const data = yield this.db('hotel_booking AS hb')
                .withSchema(this.DBO_SCHEMA)
                .select('hb.id', 'hb.booking_ref', 'hb.hotel_code', 'hb.hotel_name', 'hb.sell_price', 'hb.checkin_date', 'hb.checkout_date', 'hb.status', 'hb.finalized', 'hb.created_at')
                .where((qb) => {
                if (from_date && to_date) {
                    qb.andWhereBetween('hb.created_at', [from_date, to_date]);
                }
                if (source_type !== 'ALL') {
                    qb.andWhere('hb.source_type', source_type);
                }
                if (source_id) {
                    qb.andWhere('hb.source_id', source_id);
                }
                if (user_id) {
                    qb.andWhere('hb.created_by', user_id);
                }
                if (filter) {
                    qb.andWhere((qqb) => {
                        qqb
                            .orWhere('hb.booking_ref', filter)
                            .orWhere('hb.confirmation_no', filter)
                            .orWhere('hb.supplier_ref', filter);
                    });
                }
            })
                .limit(limit ? Number(limit) : constants_1.DATA_LIMIT)
                .offset(skip ? Number(skip) : 0)
                .orderBy('hb.created_at', 'desc');
            let total = undefined;
            if (need_total) {
                total = yield this.db('hotel_booking AS hb')
                    .withSchema(this.DBO_SCHEMA)
                    .count('hb.id AS total')
                    .where((qb) => {
                    if (from_date && to_date) {
                        qb.andWhereBetween('hb.created_at', [from_date, to_date]);
                    }
                    if (source_type !== 'ALL') {
                        qb.andWhere('hb.source_type', source_type);
                    }
                    if (source_id) {
                        qb.andWhere('hb.source_id', source_id);
                    }
                    if (user_id) {
                        qb.andWhere('hb.created_by', user_id);
                    }
                    if (filter) {
                        qb.andWhere((qqb) => {
                            qqb
                                .orWhere('hb.booking_ref', filter)
                                .orWhere('hb.confirmation_no', filter)
                                .orWhere('hb.supplier_ref', filter);
                        });
                    }
                })
                    .first();
            }
            return {
                data,
                total: total === null || total === void 0 ? void 0 : total.total,
            };
        });
    }
    getSingleHotelBooking(_a) {
        return __awaiter(this, arguments, void 0, function* ({ booking_id, source_type, source_id, user_id, }) {
            let tableName = 'agent_hotel_booking_view AS hb';
            if (source_type === 'AGENT B2C') {
                tableName = 'agent_b2c_hotel_booking_view AS hb';
            }
            return yield this.db(tableName)
                .withSchema(this.DBO_SCHEMA)
                .select('hb.*')
                .where((qb) => {
                qb.andWhere('hb.id', booking_id);
                if (source_id) {
                    qb.andWhere('hb.agency_id', source_id);
                }
                if (user_id) {
                    qb.andWhere('hb.created_by', user_id);
                }
            })
                .first();
        });
    }
    getHotelBookingTraveler(booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_booking_traveler AS hbt')
                .withSchema(this.DBO_SCHEMA)
                .select('hbt.*')
                .where((qb) => {
                qb.andWhere('hbt.booking_id', booking_id);
            });
        });
    }
    insertHotelBookingModifiedAmount(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_booking_modified_amount')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getHotelBookingModifiedAmount(booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_booking_modified_amount')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where('booking_id', booking_id)
                .first();
        });
    }
}
exports.default = HotelBookingModel;
