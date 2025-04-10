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
class MarkupSetFlightApiModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createMarkupSetFlightApi(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('markup_set_flight_api')
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getMarkupSetFlightApi(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('markup_set_flight_api as msf')
                .withSchema(this.DBO_SCHEMA)
                .select('msf.id', 'msf.status', 'msf.flight_api_id as api_id', 'fa.api as api_name', 'fa.logo as api_logo')
                .leftJoin('flight_api as fa', 'msf.flight_api_id', 'fa.id')
                .where((qb) => {
                qb.andWhere('msf.markup_set_id', query.markup_set_id);
                if (query.id) {
                    qb.andWhere('msf.id', query.id);
                }
                if (query.flight_api_id) {
                    qb.andWhere('msf.flight_api_id', query.flight_api_id);
                }
                if (query.status !== undefined) {
                    qb.andWhere('msf.status', query.status);
                }
                if (query.api_name) {
                    qb.andWhere('fa.api', query.api_name);
                }
            })
                .orderBy('msf.id', 'desc');
            return data;
        });
    }
    updateMarkupSetFlightApi(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('markup_set_flight_api')
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    deleteMarkupSetFlightApi(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('markup_set_flight_api')
                .withSchema(this.DBO_SCHEMA)
                .delete()
                .where({ id });
        });
    }
}
exports.default = MarkupSetFlightApiModel;
