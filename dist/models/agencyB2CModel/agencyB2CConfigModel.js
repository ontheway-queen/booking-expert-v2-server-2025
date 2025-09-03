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
class AgencyB2CConfigModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertHeroBGContent(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hero_bg_content')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getHeroBGContent(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, with_total = false) {
            var _a;
            const data = yield this.db('hero_bg_content')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .orderBy('order_number', 'asc')
                .andWhere('agency_id', query.agency_id)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
                if (query.type) {
                    qb.andWhere('type', query.type);
                }
            })
                .limit(query.limit ? parseInt(query.limit) : constants_1.DATA_LIMIT)
                .offset(query.skip ? parseInt(query.skip) : 0);
            let total = [];
            if (with_total) {
                total = yield this.db('hero_bg_content')
                    .withSchema(this.AGENT_B2C_SCHEMA)
                    .count('id AS total')
                    .andWhere('agency_id', query.agency_id)
                    .where((qb) => {
                    if (query.status !== undefined) {
                        qb.andWhere('status', query.status);
                    }
                    if (query.type) {
                        qb.andWhere('type', query.type);
                    }
                });
            }
            return { data, total: Number((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) || 0 };
        });
    }
    checkHeroBGContent(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hero_bg_content')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .orderBy('order_number', 'asc')
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
                .orderBy('order_number', 'desc')
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
    getPopularDestination(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, with_total = false) {
            var _a;
            const data = yield this.db('popular_destination AS pd')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('pd.*', 'dc.name AS from_airport_country', 'dci.name AS from_airport_city', 'da.name AS from_airport_name', 'da.iata_code AS from_airport_code', 'aa.name AS to_airport_name', 'aa.iata_code AS to_airport_code', 'ac.name AS to_airport_country', 'aci.name AS to_airport_city')
                .joinRaw(`LEFT JOIN public.airport AS da ON pd.from_airport = da.id`)
                .joinRaw(`LEFT JOIN public.airport AS aa ON pd.to_airport = aa.id`)
                .joinRaw(`LEFT JOIN public.country AS dc ON da.country_id = dc.id`)
                .joinRaw(`LEFT JOIN public.country AS ac ON aa.country_id = ac.id`)
                .joinRaw(`LEFT JOIN public.city AS dci ON da.city = dci.id`)
                .joinRaw(`LEFT JOIN public.city AS aci ON aa.city = aci.id`)
                .orderBy('pd.order_number', 'asc')
                .andWhere('pd.agency_id', query.agency_id)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere('pd.status', query.status);
                }
            })
                .limit(query.limit ? parseInt(query.limit) : constants_1.DATA_LIMIT)
                .offset(query.skip ? parseInt(query.skip) : 0);
            let total = [];
            if (with_total) {
                total = yield this.db('popular_destination')
                    .withSchema(this.AGENT_B2C_SCHEMA)
                    .count('id AS total')
                    .andWhere('agency_id', query.agency_id)
                    .where((qb) => {
                    if (query.status !== undefined) {
                        qb.andWhere('status', query.status);
                    }
                });
            }
            return { data, total: Number((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) || 0 };
        });
    }
    checkPopularDestination(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('popular_destination')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .orderBy('order_number', 'asc')
                .andWhere('agency_id', query.agency_id)
                .andWhere('id', query.id)
                .first();
        });
    }
    getPopularDestinationLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('popular_destination')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .where('agency_id', query.agency_id)
                .orderBy('order_number', 'desc')
                .first();
        });
    }
    updatePopularDestination(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('popular_destination')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .update(payload)
                .where('agency_id', where.agency_id)
                .where('id', where.id);
        });
    }
    deletePopularDestination(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('popular_destination')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .del()
                .where('agency_id', where.agency_id)
                .where('id', where.id);
        });
    }
    insertPopularPlaces(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('popular_places')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .insert(payload);
        });
    }
    getPopularPlaces(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, with_total = false) {
            var _a;
            const data = yield this.db('popular_places AS pp')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('pp.*', 'c.name AS country_name')
                .joinRaw(`LEFT JOIN public.country AS c ON pp.country_id = c.id`)
                .orderBy('pp.order_number', 'asc')
                .andWhere('pp.agency_id', query.agency_id)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere('pp.status', query.status);
                }
            })
                .limit(query.limit ? parseInt(query.limit) : constants_1.DATA_LIMIT)
                .offset(query.skip ? parseInt(query.skip) : 0);
            let total = [];
            if (with_total) {
                total = yield this.db('popular_places')
                    .withSchema(this.AGENT_B2C_SCHEMA)
                    .count('id AS total')
                    .andWhere('agency_id', query.agency_id)
                    .where((qb) => {
                    if (query.status !== undefined) {
                        qb.andWhere('status', query.status);
                    }
                });
            }
            return { data, total: Number((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) || 0 };
        });
    }
    checkPopularPlace(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('popular_places')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .andWhere('agency_id', query.agency_id)
                .andWhere('id', query.id)
                .first();
        });
    }
    getPopularPlaceLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('popular_places')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .where('agency_id', query.agency_id)
                .orderBy('order_number', 'desc')
                .first();
        });
    }
    updatePopularPlace(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('popular_places')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .update(payload)
                .where('agency_id', where.agency_id)
                .andWhere('id', where.id);
        });
    }
    deletePopularPlace(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('popular_places')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .del()
                .where('agency_id', where.agency_id)
                .where('id', where.id);
        });
    }
    insertSiteConfig(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('site_config')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .insert(payload);
        });
    }
    getSiteConfig(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('site_config')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .where('agency_id', query.agency_id)
                .first();
        });
    }
    updateConfig(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('site_config')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .update(payload)
                .where('agency_id', where.agency_id);
        });
    }
    insertSocialLink(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('social_links')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getSocialLink(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, with_total = false) {
            var _a;
            const data = yield this.db('social_links AS sl')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('sl.id', 'sl.link', 'sl.status', 'sl.order_number', 'sl.social_media_id', 'sm.name AS media', 'sm.logo')
                .joinRaw(`LEFT JOIN public.social_media AS sm ON sl.social_media_id = sm.id`)
                .orderBy('sl.order_number', 'asc')
                .andWhere('sl.agency_id', query.agency_id)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere('sl.status', query.status);
                }
            })
                .limit(query.limit ? parseInt(query.limit) : constants_1.DATA_LIMIT)
                .offset(query.skip ? parseInt(query.skip) : 0);
            let total = [];
            if (with_total) {
                total = yield this.db('social_links')
                    .withSchema(this.AGENT_B2C_SCHEMA)
                    .count('id AS total')
                    .andWhere('agency_id', query.agency_id)
                    .where((qb) => {
                    if (query.status !== undefined) {
                        qb.andWhere('status', query.status);
                    }
                });
            }
            return { data, total: Number((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) || 0 };
        });
    }
    checkSocialLink(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('social_links')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .andWhere('agency_id', query.agency_id)
                .andWhere('id', query.id)
                .first();
        });
    }
    getSocialLinkLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('social_links')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .where('agency_id', query.agency_id)
                .orderBy('order_number', 'desc')
                .first();
        });
    }
    updateSocialLink(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('social_links')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .update(payload)
                .where('agency_id', where.agency_id)
                .andWhere('id', where.id);
        });
    }
    deleteSocialLink(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('social_links')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .del()
                .where('agency_id', where.agency_id)
                .where('id', where.id);
        });
    }
    insertHotDeals(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hot_deals')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .insert(payload);
        });
    }
    getHotDeals(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, with_total = false) {
            var _a;
            const data = yield this.db('hot_deals')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .orderBy('order_number', 'asc')
                .andWhere('agency_id', query.agency_id)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
            });
            let total = [];
            if (with_total) {
                total = yield this.db('hot_deals')
                    .withSchema(this.AGENT_B2C_SCHEMA)
                    .count('id AS total')
                    .andWhere('agency_id', query.agency_id)
                    .where((qb) => {
                    if (query.status !== undefined) {
                        qb.andWhere('status', query.status);
                    }
                });
            }
            return { data, total: Number((_a = total[0]) === null || _a === void 0 ? void 0 : _a.total) || 0 };
        });
    }
    checkHotDeals(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hot_deals')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .andWhere('agency_id', query.agency_id)
                .andWhere('id', query.id)
                .first();
        });
    }
    getHotDealsLastNo(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hot_deals')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .where('agency_id', query.agency_id)
                .orderBy('order_number', 'desc')
                .first();
        });
    }
    updateHotDeals(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hot_deals')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .update(payload)
                .where('agency_id', where.agency_id)
                .andWhere('id', where.id);
        });
    }
    deleteHotDeals(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('hot_deals')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .del()
                .where('agency_id', where.agency_id)
                .where('id', where.id);
        });
    }
    insertPopUpBanner(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('pop_up_banner')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .insert(payload);
        });
    }
    getPopUpBanner(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('pop_up_banner')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .andWhere('agency_id', query.agency_id)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
                if (query.pop_up_for) {
                    qb.andWhere('pop_up_for', query.pop_up_for);
                }
            });
        });
    }
    getSinglePopUpBanner(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('pop_up_banner')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .select('*')
                .andWhere('agency_id', query.agency_id)
                .andWhere('status', query.status)
                .andWhere('pop_up_for', query.pop_up_for)
                .first();
        });
    }
    updatePopUpBanner(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('pop_up_banner')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .update(payload)
                .where('agency_id', where.agency_id)
                .andWhere('pop_up_for', where.pop_up_for);
        });
    }
    deletePopUpBanner(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('pop_up_banner')
                .withSchema(this.AGENT_B2C_SCHEMA)
                .del()
                .where('agency_id', where.agency_id)
                .where('id', where.id);
        });
    }
    createVisaType(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_type')
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getAllVisaType(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_type')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'name')
                .where('source_id', query.source_id)
                .andWhere('source_type', query.source_type)
                .andWhere('is_deleted', query.is_deleted);
        });
    }
    getSingleVisaType(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_type')
                .withSchema(this.SERVICE_SCHEMA)
                .select('*')
                .where('id', query.id)
                .andWhere('is_deleted', false)
                .first();
        });
    }
    getSingleVisaTypeByName(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_type')
                .withSchema(this.SERVICE_SCHEMA)
                .select('*')
                .whereILike('name', query.name)
                .andWhere('source_id', query.source_id)
                .andWhere('source_type', query.source_type)
                .andWhere('is_deleted', query.is_deleted)
                .first();
        });
    }
    deleteVisaType(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_type')
                .withSchema(this.SERVICE_SCHEMA)
                .update({ is_deleted: true })
                .where('id', where.id)
                .andWhere('source_id', where.source_id)
                .andWhere('source_type', where.source_type);
        });
    }
    createVisaMode(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_mode')
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, 'id');
        });
    }
    getAllVisaMode(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_mode')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'name')
                .where('source_id', query.source_id)
                .andWhere('source_type', query.source_type)
                .andWhere('is_deleted', query.is_deleted);
        });
    }
    getSingleVisaMode(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_mode')
                .withSchema(this.SERVICE_SCHEMA)
                .select('*')
                .where('id', query.id)
                .andWhere('is_deleted', query.is_deleted)
                .first();
        });
    }
    getSingleVisaModeByName(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_mode')
                .withSchema(this.SERVICE_SCHEMA)
                .select('*')
                .whereILike('name', query.name)
                .andWhere('source_id', query.source_id)
                .andWhere('source_type', query.source_type)
                .andWhere('is_deleted', query.is_deleted)
                .first();
        });
    }
    deleteVisaMode(where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_mode')
                .withSchema(this.SERVICE_SCHEMA)
                .update({ is_deleted: true })
                .where('id', where.id)
                .andWhere('source_id', where.source_id)
                .andWhere('source_type', where.source_type);
        });
    }
}
exports.default = AgencyB2CConfigModel;
