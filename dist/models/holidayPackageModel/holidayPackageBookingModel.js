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
const holidayConstants_1 = require("../../utils/miscellaneous/holidayConstants");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class HolidayPackageBookingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertHolidayBooking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("holiday_package_booking")
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getHolidayBookingList(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const view_name = query.booked_by === constants_1.SOURCE_B2C ? holidayConstants_1.VIEW_HOLIDAY_PACKAGE_BOOKING_BY_B2C : query.booked_by === constants_1.SOURCE_AGENT_B2C ? holidayConstants_1.VIEW_HOLIDAY_PACKAGE_BOOKING_BY_AGENT_B2C : holidayConstants_1.VIEW_HOLIDAY_PACKAGE_BOOKING_BY_AGENT;
            const data = yield this.db(`${view_name} as hb`)
                .withSchema(this.SERVICE_SCHEMA)
                .select("hb.id", "hb.booking_ref", "hb.holiday_package_title", "hb.source_type", "hb.source_name", "hb.total_adult", "hb.total_child", "hb.total_price", "hb.travel_date", "hb.created_at", "hb.status")
                .where((qb) => {
                if (query.status) {
                    if (Array.isArray(query.status)) {
                        qb.whereIn("hb.status", query.status);
                    }
                    else {
                        qb.andWhere("hb.status", query.status);
                    }
                }
                if (query.from_date && query.to_date)
                    qb.andWhereBetween("hb.created_at", [query.from_date, query.to_date]);
                if (query.filter) {
                    qb.andWhere((qbc) => {
                        qbc.whereILike("hb.booking_ref", `${query.filter}%`)
                            .orWhereILike("source_name", `${query.filter}%`);
                    });
                }
                if (query.source_id)
                    qb.andWhere("hb.source_id", query.source_id);
                if (query.user_id)
                    qb.andWhere("hb.user_id", query.user_id);
                if (query.holiday_package_id)
                    qb.andWhere("hb.holiday_package_id", query.holiday_package_id);
            })
                .orderBy("hb.id", "desc")
                .limit(query.limit || 100)
                .offset(query.skip || 0);
            let total = [];
            if (is_total) {
                total = yield this.db(`${view_name} as hb`)
                    .withSchema(this.SERVICE_SCHEMA)
                    .count("hb.id as total")
                    .where((qb) => {
                    if (Array.isArray(query.status)) {
                        qb.whereIn("hb.status", query.status);
                    }
                    else {
                        qb.andWhere("hb.status", query.status);
                    }
                    if (query.from_date && query.to_date)
                        qb.andWhereBetween("hb.created_at", [query.from_date, query.to_date]);
                    if (query.filter) {
                        qb.andWhere((qbc) => {
                            qbc.whereILike("hb.booking_ref", `${query.filter}%`)
                                .orWhereILike("hb.package_name", `${query.filter}%`);
                        });
                    }
                    if (query.source_id)
                        qb.andWhere("hb.source_id", query.source_id);
                    if (query.user_id)
                        qb.andWhere("hb.user_id", query.user_id);
                    if (query.holiday_package_id)
                        qb.andWhere("hb.holiday_package_id", query.holiday_package_id);
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total
            };
        });
    }
    getSingleHolidayBooking(where) {
        return __awaiter(this, void 0, void 0, function* () {
            const view_name = where.booked_by === constants_1.SOURCE_B2C ? holidayConstants_1.VIEW_HOLIDAY_PACKAGE_BOOKING_BY_B2C : where.booked_by === constants_1.SOURCE_AGENT_B2C ? holidayConstants_1.VIEW_HOLIDAY_PACKAGE_BOOKING_BY_AGENT_B2C : holidayConstants_1.VIEW_HOLIDAY_PACKAGE_BOOKING_BY_AGENT;
            return yield this.db(`${view_name} as hb`)
                .withSchema(this.SERVICE_SCHEMA)
                .select("*")
                .where((qb) => {
                qb.andWhere("hb.id", where.id);
                if (where.source_id)
                    qb.andWhere("hb.source_id", where.source_id);
                if (where.user_id)
                    qb.andWhere("hb.user_id", where.user_id);
            })
                .first();
        });
    }
    updateHolidayBooking(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("holiday_package_booking")
                .withSchema(this.SERVICE_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
}
exports.default = HolidayPackageBookingModel;
