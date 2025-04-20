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
const constants_1 = require("../../utils/miscellaneous/constants");
class FlightBookingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertFlightBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("flight_booking")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getFlightBookingList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db("flight_booking as fb")
                .withSchema(this.DBO_SCHEMA)
                .leftJoin("agent.agency as ag", function () {
                this.on("fb.source_id", "=", "ag.id").andOnVal("fb.source_type", "in", [constants_1.SOURCE_AGENT, constants_1.SOURCE_SUB_AGENT, constants_1.SOURCE_AGENT_B2C]);
            })
                .leftJoin("b2c.users as b2c", function () {
                this.on("fb.created_by", "=", "b2c.id").andOnVal("fb.source_type", "=", constants_1.SOURCE_B2C);
            })
                .leftJoin("external.external as ex", function () {
                this.on("fb.source_id", "=", "ex.id").andOnVal("fb.source_type", "=", constants_1.SOURCE_EXTERNAL);
            })
                .select("fb.id", "fb.booking_ref", "fb.source_type", "fb.source_id", this.db.raw(`
      CASE 
        WHEN fb.source_type IN (${constants_1.SOURCE_AGENT}, ${constants_1.SOURCE_SUB_AGENT}, ${constants_1.SOURCE_AGENT_B2C}) THEN ag.agency_name
        WHEN fb.source_type = ${constants_1.SOURCE_B2C} THEN b2c.name
        WHEN fb.source_type = ${constants_1.SOURCE_EXTERNAL} THEN ex.name
        ELSE NULL
      END AS source_name
    `), "fb.api", "fb.created_at", "fb.travel_date", "fb.gds_pnr", "fb.journey_type", "fb.total_passenger", "fb.status", "fb.payable_amount", "fb.route")
                .where((qb) => {
                if (query.status) {
                    qb.andWhere("fb.status", query.status);
                }
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween("fb.created_at", [query.from_date, query.to_date]);
                }
                if (query.filter) {
                    qb.andWhere((qbc) => {
                        qbc.whereILike("fb.booking_ref", `${query.filter}%`);
                        qbc.orWhereILike("fb.gds_pnr", `${query.filter}`);
                    });
                }
                if (query.source_id) {
                    qb.andWhere("fb.source_id", query.source_id);
                }
            })
                .orderBy("fb.id", "desc")
                .limit(query.limit || 100)
                .offset(query.skip || 0);
            let total = [];
            if (is_total) {
                total = yield this.db("flight_booking as fb")
                    .withSchema(this.DBO_SCHEMA)
                    .count("fb.id as total")
                    .where((qb) => {
                    if (query.status) {
                        qb.andWhere("fb.status", query.status);
                    }
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween("fb.created_at", [query.from_date, query.to_date]);
                    }
                    if (query.filter) {
                        qb.andWhere((qbc) => {
                            qbc.whereILike("fb.booking_ref", `${query.filter}%`);
                            qbc.orWhereILike("fb.gds_pnr", `${query.filter}`);
                        });
                    }
                    if (query.source_id) {
                        qb.andWhere("fb.source_id", query.source_id);
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total
            };
        });
    }
    getSingleFlightBooking(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("flight_booking as fb")
                .withSchema(this.DBO_SCHEMA)
                .leftJoin("agent.agency as ag", function () {
                this.on("fb.source_id", "=", "ag.id").andOnVal("fb.source_type", "in", [constants_1.SOURCE_AGENT, constants_1.SOURCE_SUB_AGENT, constants_1.SOURCE_AGENT_B2C]);
            })
                .leftJoin("b2c.users as b2c", function () {
                this.on("fb.created_by", "=", "b2c.id").andOnVal("fb.source_type", "=", constants_1.SOURCE_B2C);
            })
                .leftJoin("external.external as ex", function () {
                this.on("fb.source_id", "=", "ex.id").andOnVal("fb.source_type", "=", constants_1.SOURCE_EXTERNAL);
            })
                .leftJoin("agent.agency_user as agu", function () {
                this.on("fb.created_by_user_id", "=", "agu.id").andOnVal("fb.source_type", "in", [constants_1.SOURCE_AGENT, constants_1.SOURCE_SUB_AGENT]);
            })
                .leftJoin("agent_b2c.users as ab", function () {
                this.on("fb.created_by_user_id", "=", "ab.id").andOnVal("fb.source_type", "=", constants_1.SOURCE_AGENT_B2C);
            })
                .leftJoin("b2c.users as b2c2", function () {
                this.on("fb.created_by_user_id", "=", "b2c2.id").andOnVal("fb.source_type", "=", constants_1.SOURCE_B2C);
            })
                .leftJoin("external.external_user as eu", function () {
                this.on("fb.created_by_user_id", "=", "eu.id").andOnVal("fb.source_type", "=", constants_1.SOURCE_EXTERNAL);
            })
                .select("fb.id", "fb.booking_ref", "fb.source_type", "fb.source_id", this.db.raw(`
      CASE 
        WHEN fb.source_type IN (${constants_1.SOURCE_AGENT}, ${constants_1.SOURCE_SUB_AGENT}, ${constants_1.SOURCE_AGENT_B2C}) THEN ag.agency_name
        WHEN fb.source_type = ${constants_1.SOURCE_B2C} THEN b2c.name
        WHEN fb.source_type = ${constants_1.SOURCE_EXTERNAL} THEN ex.name
        ELSE NULL
      END AS source_name
    `), this.db.raw(`
        CASE 
          WHEN fb.source_type IN (${constants_1.SOURCE_AGENT}, ${constants_1.SOURCE_SUB_AGENT}) THEN agu.name
          WHEN fb.source_type = ${constants_1.SOURCE_AGENT_B2C} THEN ab.name
          WHEN fb.source_type = ${constants_1.SOURCE_B2C} THEN b2c2.name
          WHEN fb.source_type = ${constants_1.SOURCE_EXTERNAL} THEN eu.name
          ELSE NULL
        END AS created_by
      `), "fb.api", "fb.created_at", "fb.travel_date", "fb.gds_pnr", "fb.journey_type", "fb.total_passenger", "fb.status", "fb.payable_amount", "fb.source_id", "fb.base_fare", "fb.tax", "fb.ait", "fb.ticket_price", "fb.markup_price", "fb.markup_type", "fb.agent_markup", "fb.refundable", "fb.api_booking_ref", "fb.route", "fb.ticket_issue_last_time", "fb.airline_pnr", "fb.cancelled_at", "fb.issued_at")
                .where((qb) => {
                qb.andWhere("fb.id", id);
            })
                .first();
        });
    }
    updateFlightBooking(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("flight_booking")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    checkFlightBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const db = this.db;
            const query = db("flight_booking as fb")
                .withSchema(this.DBO_SCHEMA)
                .join("flight_booking_segment as fs", "fs.flight_booking_id", "fb.id")
                .join("flight_booking_traveler as fbt", "fbt.flight_booking_id", "fb.id")
                .countDistinct("fb.id as total")
                .where({
                "fb.route": payload.route,
                "fs.departure_date": payload.departure_date,
                "fs.flight_number": payload.flight_number
            });
            // Handle status filter (single or array)
            if (Array.isArray(payload.status)) {
                query.whereIn("fb.status", payload.status);
            }
            else {
                query.where("fb.status", payload.status);
            }
            // Build passenger matching conditions
            query.andWhere(function () {
                const passengerConditions = this.where(false); // Start with false for OR chaining
                payload.passengers.forEach(passenger => {
                    const passengerQuery = {
                        "fbt.first_name": passenger.first_name,
                        "fbt.last_name": passenger.last_name
                    };
                    const identifierConditions = [];
                    if (passenger.passport) {
                        identifierConditions.push(db.raw("(fbt.passport_number IS NOT NULL AND fbt.passport_number = ?)", [passenger.passport]));
                    }
                    if (passenger.email) {
                        identifierConditions.push(db.raw("(fbt.email IS NOT NULL AND fbt.email = ?)", [passenger.email]));
                    }
                    if (passenger.phone) {
                        identifierConditions.push(db.raw("(fbt.phone IS NOT NULL AND fbt.phone = ?)", [passenger.phone]));
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
