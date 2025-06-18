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
class FlightBookingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertFlightBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_booking')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getFlightBookingList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const view_name = query.booked_by === constants_1.SOURCE_AGENT
                ? 'view_flight_booking_by_agent'
                : query.booked_by === constants_1.SOURCE_SUB_AGENT
                    ? 'view_flight_booking_by_agent'
                    : query.booked_by === constants_1.SOURCE_AGENT_B2C
                        ? 'view_flight_booking_by_agent_b2c'
                        : query.booked_by === constants_1.SOURCE_B2C
                            ? 'view_flight_booking_by_b2c'
                            : undefined;
            const data = yield this.db(`${view_name}`)
                .withSchema(this.DBO_SCHEMA)
                .select('id', 'booking_ref', 'source_type', 'source_id', 'source_name', 'source_logo', 'api', 'created_at', 'travel_date', 'gds_pnr', 'journey_type', 'total_passenger', 'status', 'payable_amount', 'route')
                .where((qb) => {
                if (query.status) {
                    qb.andWhere('status', query.status);
                }
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween('created_at', [query.from_date, query.to_date]);
                }
                if (query.filter) {
                    qb.andWhere((qbc) => {
                        qbc.whereILike('booking_ref', `${query.filter}%`);
                        qbc.orWhereILike('gds_pnr', `${query.filter}`),
                            qbc.orWhereILike('source_name', `%${query.filter}%`);
                    });
                }
                if (query.source_id) {
                    qb.andWhere('source_id', query.source_id);
                }
                if (query.created_by) {
                    qb.andWhere('created_by', query.created_by);
                }
            })
                .orderBy('id', 'desc')
                .limit(query.limit || 100)
                .offset(query.skip || 0);
            let total = [];
            if (is_total) {
                total = yield this.db(`${view_name}`)
                    .withSchema(this.DBO_SCHEMA)
                    .count('id as total')
                    .where((qb) => {
                    if (query.status) {
                        qb.andWhere('status', query.status);
                    }
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween('created_at', [query.from_date, query.to_date]);
                    }
                    if (query.filter) {
                        qb.andWhere((qbc) => {
                            qbc.whereILike('booking_ref', `${query.filter}%`);
                            qbc.orWhereILike('gds_pnr', `${query.filter}`);
                            qbc.orWhereILike('source_name', `%${query.filter}%`);
                        });
                    }
                    if (query.source_id) {
                        qb.andWhere('source_id', query.source_id);
                    }
                    if (query.created_by) {
                        qb.andWhere('created_by', query.created_by);
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    getSingleFlightBooking(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, booked_by, agency_id, user_id } = where;
            const view_name = booked_by === constants_1.SOURCE_AGENT
                ? 'view_flight_booking_by_agent'
                : booked_by === constants_1.SOURCE_SUB_AGENT
                    ? 'view_flight_booking_by_agent'
                    : booked_by === constants_1.SOURCE_AGENT_B2C
                        ? 'view_flight_booking_by_agent_b2c'
                        : booked_by === constants_1.SOURCE_B2C
                            ? 'view_flight_booking_by_b2c'
                            : undefined;
            return yield this.db(`${view_name}`)
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                qb.andWhere({ id });
                if (agency_id) {
                    qb.andWhere('source_id', agency_id);
                }
                if (user_id) {
                    qb.andWhere('created_by', user_id);
                }
            })
                .first();
        });
    }
    updateFlightBooking(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_booking')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    checkFlightBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const db = this.db;
            const query = db('flight_booking as fb')
                .withSchema(this.DBO_SCHEMA)
                .join('flight_booking_segment as fs', 'fs.flight_booking_id', 'fb.id')
                .join('flight_booking_traveler as fbt', 'fbt.flight_booking_id', 'fb.id')
                .countDistinct('fb.id as total')
                .where({
                'fb.route': payload.route,
                'fs.departure_date': payload.departure_date,
                'fs.flight_number': payload.flight_number,
            });
            // Handle status filter (single or array)
            if (Array.isArray(payload.status)) {
                query.whereIn('fb.status', payload.status);
            }
            else {
                query.where('fb.status', payload.status);
            }
            // Build passenger matching conditions
            query.andWhere(function () {
                const passengerConditions = this.where(false); // Start with false for OR chaining
                payload.passengers.forEach((passenger) => {
                    const passengerQuery = {
                        'fbt.first_name': passenger.first_name,
                        'fbt.last_name': passenger.last_name,
                    };
                    const identifierConditions = [];
                    if (passenger.passport) {
                        identifierConditions.push(db.raw('(fbt.passport_number IS NOT NULL AND fbt.passport_number = ?)', [passenger.passport]));
                    }
                    if (passenger.email) {
                        identifierConditions.push(db.raw('(fbt.email IS NOT NULL AND fbt.email = ?)', [
                            passenger.email,
                        ]));
                    }
                    if (passenger.phone) {
                        identifierConditions.push(db.raw('(fbt.phone IS NOT NULL AND fbt.phone = ?)', [
                            passenger.phone,
                        ]));
                    }
                    // Combine passenger name + any identifier
                    passengerConditions.orWhere(function () {
                        this.where(passengerQuery);
                        if (identifierConditions.length > 0) {
                            this.andWhere(function () {
                                for (const condition of identifierConditions) {
                                    this.orWhere(condition);
                                }
                            });
                        }
                    });
                });
            });
            const result = yield query.first();
            return Number((_a = result === null || result === void 0 ? void 0 : result.total) !== null && _a !== void 0 ? _a : 0);
        });
    }
}
exports.default = FlightBookingModel;
