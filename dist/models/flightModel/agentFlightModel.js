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
class AgentFlightModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertFlightBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("flight_booking")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    insertFlightBookingPriceBreakdown(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("flight_booking_price_breakdown")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    insertFlightBookingSegment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("flight_booking_segment")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    insertFlightBookingTraveler(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("flight_booking_traveler")
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    checkFlightBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const query = this.db("flight_booking as fb")
                .withSchema(this.AGENT_SCHEMA)
                .join("flight_booking_segment as fs", "fs.flight_booking_id", "fb.id")
                .join("flight_booking_traveler as fbt", "fbt.flight_booking_id", "fb.id")
                .countDistinct("fb.id as total")
                .where("fb.route", payload.route)
                .andWhere(function () {
                if (Array.isArray(payload.status)) {
                    this.whereIn("fb.status", payload.status);
                }
                else {
                    this.andWhere({ "fb.status": payload.status });
                }
            })
                .andWhere("fs.departure_date", payload.departure_date)
                .andWhere("fs.flight_number", payload.flight_number)
                .where(qb => {
                payload.passengers.forEach((p, index) => {
                    if (index === 0) {
                        qb.where(function () {
                            this.where("fbt.first_name", p.first_name)
                                .andWhere("fbt.last_name", p.last_name)
                                .andWhere(subQb => {
                                var _a, _b, _c;
                                subQb.whereNotNull("fbt.passport_number").orWhere("fbt.passport_number", (_a = p.passport) !== null && _a !== void 0 ? _a : null);
                                subQb.whereNotNull("fbt.email").orWhere("fbt.email", (_b = p.email) !== null && _b !== void 0 ? _b : null);
                                subQb.whereNotNull("fbt.phone").orWhere("fbt.phone", (_c = p.phone) !== null && _c !== void 0 ? _c : null);
                            });
                        });
                    }
                    else {
                        qb.orWhere(function () {
                            this.where("fbt.first_name", p.first_name)
                                .andWhere("fbt.last_name", p.last_name)
                                .andWhere(subQb => {
                                var _a, _b, _c;
                                subQb.whereNotNull("fbt.passport_number").orWhere("fbt.passport_number", (_a = p.passport) !== null && _a !== void 0 ? _a : null);
                                subQb.whereNotNull("fbt.email").orWhere("fbt.email", (_b = p.email) !== null && _b !== void 0 ? _b : null);
                                subQb.whereNotNull("fbt.phone").orWhere("fbt.phone", (_c = p.phone) !== null && _c !== void 0 ? _c : null);
                            });
                        });
                    }
                });
            })
                .first();
            return Number((_b = (_a = (yield query)) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0);
        });
    }
}
exports.default = AgentFlightModel;
