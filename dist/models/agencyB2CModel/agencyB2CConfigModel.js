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
class AgencyB2CConfigModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertHeroBGContent(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hero_bg_content')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .insert(payload);
        });
    }
    getHeroBGContent(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hero_bg_content')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .orderBy('order_no', 'asc')
                .andWhere('agency_id', query.agency_id)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
                if (query.type) {
                    qb.andWhere('type', query.type);
                }
            });
        });
    }
    checkHeroBGContent(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hero_bg_content')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .orderBy('order_no', 'asc')
                .andWhere('agency_id', query.agency_id)
                .andWhere('id', query.id);
        });
    }
    getHeroBGContentLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hero_bg_content')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .where('agency_id', query.agency_id)
                .orderBy('order_no', 'desc')
                .first();
        });
    }
    updateHeroBGContent(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hero_bg_content')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .update(payload)
                .where('agency_id', where.agency_id)
                .where('id', where.id);
        });
    }
    deleteHeroBGContent(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hero_bg_content')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .del()
                .where('agency_id', where.agency_id)
                .where('id', where.id);
        });
    }
    insertPopularDestination(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('popular_destination')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .insert(payload);
        });
    }
    insertPopularPlaces(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('popular_places')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .insert(payload);
        });
    }
    insertSiteConfig(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('site_config')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .insert(payload);
        });
    }
    insertSocialLink(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('social_links')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .insert(payload);
        });
    }
}
exports.default = AgencyB2CConfigModel;
