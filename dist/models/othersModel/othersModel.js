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
class OthersModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertHotelSearchHistory(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_search_history')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    getHotelSearchHistory(_a) {
        return __awaiter(this, arguments, void 0, function* ({ agency_id, limit, skip, user_id, from_date, to_date, user_type, }) {
            let query = this.db('hotel_search_history AS hsh')
                .withSchema(this.DBO_SCHEMA)
                .select('hsh.id', 'hsh.name', 'hsh.code', 'hsh.nationality', 'hsh.check_in_date', 'hsh.check_out_date', 'hsh.guest_n_rooms', 'hsh.destination_type', 'hsh.created_at')
                .where((qb) => {
                if (user_type && user_type !== 'All') {
                    qb.andWhere('hsh.user_type', user_type);
                }
                if (agency_id) {
                    qb.andWhere('hsh.agency_id', agency_id);
                }
                if (user_id) {
                    qb.andWhere('hsh.user_id', user_id);
                }
                if (from_date && to_date) {
                    qb.andWhereBetween('hsh.created_at', [from_date, to_date]);
                }
            })
                .limit(limit ? Number(limit) : constants_1.DATA_LIMIT)
                .offset(skip ? Number(skip) : 0)
                .orderBy('hsh.created_at', 'desc');
            return yield query;
        });
    }
}
exports.default = OthersModel;
