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
class SubAgentMarkupModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createSubAgentMarkup(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('sub_agent_markup')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload);
        });
    }
    updateSubAgentMarkup(payload, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('sub_agent_markup')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where('agency_id', agency_id);
        });
    }
    getSubAgentMarkup(agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('sub_agent_markup')
                .withSchema(this.AGENT_SCHEMA)
                .select('*')
                .where({ agency_id })
                .first();
        });
    }
}
exports.default = SubAgentMarkupModel;
