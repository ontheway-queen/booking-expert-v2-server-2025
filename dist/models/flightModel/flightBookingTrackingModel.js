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
class FlightBookingTrackingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertFlightBookingTracking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_booking_tracking')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getFlightBookingTracking(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const { flight_booking_id, limit, skip } = query;
            const data = yield this.db('flight_booking_tracking')
                .withSchema(this.DBO_SCHEMA)
                .select('id', 'description', 'created_at')
                .where({ flight_booking_id })
                .limit(limit || 100)
                .offset(skip || 0);
            let total = [];
            if (is_total) {
                total = yield this.db('flight_booking_tracking')
                    .withSchema(this.DBO_SCHEMA)
                    .count('id as total')
                    .where({ flight_booking_id });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    deleteFlightBookingTracking(_a) {
        return __awaiter(this, arguments, void 0, function* ({ flight_booking_id, tracking_id, }) {
            yield this.db('flight_booking_tracking')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where((qb) => {
                if (flight_booking_id) {
                    qb.andWhere('flight_booking_id', flight_booking_id);
                }
                if (tracking_id) {
                    qb.andWhere('id', tracking_id);
                }
            });
        });
    }
}
exports.default = FlightBookingTrackingModel;
