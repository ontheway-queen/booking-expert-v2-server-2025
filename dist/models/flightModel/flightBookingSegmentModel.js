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
class FlightBookingSegmentModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertFlightBookingSegment(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_booking_segment')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getFlightBookingSegment(flight_booking_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('flight_booking_segment')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where({ flight_booking_id });
        });
    }
    deleteFlightBookingSegment(_a) {
        return __awaiter(this, arguments, void 0, function* ({ flight_booking_id, segment_id, }) {
            return yield this.db('flight_booking_segment')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where((qb) => {
                if (flight_booking_id) {
                    qb.andWhere({ flight_booking_id });
                }
                if (segment_id) {
                    qb.andWhere('id', segment_id);
                }
            });
        });
    }
}
exports.default = FlightBookingSegmentModel;
