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
class B2CMarkupConfigModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    getB2CMarkupConfigData(type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('b2c_markup_config')
                .withSchema(this.DBO_SCHEMA)
                .select('b2c_markup_config.id', 'b2c_markup_config.markup_set_id', 'b2c_markup_config.type', 'dynamic_fare_set.name')
                .leftJoin('dynamic_fare_set', 'b2c_markup_config.markup_set_id', 'dynamic_fare_set.id')
                .where((qb) => {
                if (type !== 'Both') {
                    qb.where('dynamic_fare_set.type', type);
                }
            });
        });
    }
    upsertB2CMarkupConfig(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            //update
            const res = yield this.db('b2c_markup_config')
                .withSchema(this.DBO_SCHEMA)
                .update('markup_set_id', payload.markup_set_id)
                .where('type', payload.type);
            //if update is not successful then insert
            if (!res) {
                yield this.db('b2c_markup_config')
                    .withSchema(this.DBO_SCHEMA)
                    .insert(payload);
            }
        });
    }
}
exports.default = B2CMarkupConfigModel;
