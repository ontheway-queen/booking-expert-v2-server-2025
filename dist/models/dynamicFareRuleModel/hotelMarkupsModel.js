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
class HotelMarkupsModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // Insert set hotel commission
    insertHotelMarkup(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_markups')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    // Get set Hotel Commission
    getHotelMarkup(_a) {
        return __awaiter(this, arguments, void 0, function* ({ markup_for, set_id, status, }) {
            return yield this.db('hotel_markup_set_view')
                .withSchema(this.DBO_SCHEMA)
                .select('*')
                .where((qb) => {
                qb.andWhere('set_id', set_id);
                if (markup_for !== 'Both') {
                    qb.andWhere('markup_for', markup_for);
                }
                if (status !== undefined) {
                    qb.andWhere('status', status);
                }
            });
        });
    }
    updateHotelMarkup(payload, conditions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_markups')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .andWhere('set_id', conditions.set_id)
                .andWhere('markup_for', conditions.markup_for);
        });
    }
    deleteHotelMarkup(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hotel_markups')
                .withSchema(this.DBO_SCHEMA)
                .where('id', id);
        });
    }
}
exports.default = HotelMarkupsModel;
