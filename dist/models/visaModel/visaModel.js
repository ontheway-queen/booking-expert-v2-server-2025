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
const visaConstants_1 = require("../../utils/miscellaneous/visaConstants");
class VisaModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createVisa(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa').withSchema(this.SERVICE_SCHEMA).insert(payload, 'id');
        });
    }
    updateVisa(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa').withSchema(this.SERVICE_SCHEMA).update(payload).where({ id });
        });
    }
    checkVisa(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa')
                .withSchema(this.SERVICE_SCHEMA)
                .select('*')
                .where((qb) => {
                qb.andWhere('is_deleted', query.is_deleted);
                if (query.slug) {
                    qb.andWhere('slug', query.slug);
                }
                if (query.id) {
                    qb.andWhere('id', query.id);
                }
                if (query.country_id) {
                    qb.andWhere('country_id', query.country_id);
                }
                if (query.source_id) {
                    qb.andWhere('source_id', query.source_id);
                }
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
            });
        });
    }
    getVisaList(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryResult = yield this.db('visa as v')
                .withSchema(this.SERVICE_SCHEMA)
                .select('v.id', 'c.nice_name as country_name', 'v.title', 'vt.name as visa_type', 'vm.name as visa_mode', 'v.max_validity', 'v.image')
                .joinRaw(`LEFT JOIN public.country AS c ON c.id = v.country_id`)
                .leftJoin('visa_type as vt', 'vt.id', 'v.visa_type_id')
                .leftJoin('visa_mode as vm', 'vm.id', 'v.visa_mode_id')
                .where((qb) => {
                qb.andWhere('v.is_deleted', query.is_deleted);
                qb.andWhere('v.source_id', query.source_id);
                qb.andWhere('v.source_type', query.source_type);
                if (query.status !== undefined) {
                    qb.andWhere('v.status', query.status);
                }
                if (query.country_id) {
                    qb.andWhere('v.country_id', query.country_id);
                }
                if (query.filter) {
                    qb.andWhere((subQb) => {
                        subQb
                            .where('v.title', 'Ilike', `%${query.filter}%`)
                            .orWhere('v.slug', 'Ilike', `%${query.filter}%`);
                    });
                }
            })
                .orderBy('v.id', 'desc')
                .limit(query.limit)
                .offset(query.skip);
            const total = yield this.db('visa')
                .withSchema(this.SERVICE_SCHEMA)
                .count('id as total')
                .where((qb) => {
                qb.andWhere('is_deleted', query.is_deleted);
                qb.andWhere('source_id', query.source_id);
                qb.andWhere('source_type', query.source_type);
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
                if (query.country_id) {
                    qb.andWhere('country_id', query.country_id);
                }
                if (query.filter) {
                    qb.andWhere((subQb) => {
                        subQb
                            .where('title', 'Ilike', `%${query.filter}%`)
                            .orWhere('slug', 'Ilike', `%${query.filter}%`);
                    });
                }
            });
            return {
                data: queryResult,
                total: Number(total[0].total),
            };
        });
    }
    getSingleVisa(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'title', 'slug', 'description', 'image', 'status', 'country_id', 'visa_type_id', 'visa_mode_id', 'visa_fee', 'processing_fee', 'max_validity', 'stay_validity', 'documents_details', 'required_fields', 'meta_title', 'meta_description', 'visa_for')
                .where((qb) => {
                qb.andWhere('is_deleted', query.is_deleted);
                qb.andWhere('source_id', query.source_id);
                qb.andWhere('source_type', query.source_type);
                if (query.id) {
                    qb.andWhere('id', query.id);
                }
                if (query.slug) {
                    qb.andWhere('slug', query.slug);
                }
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
            })
                .first();
        });
    }
    getAgentB2CVisaList(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa as v')
                .withSchema(this.SERVICE_SCHEMA)
                .select('v.id', 'v.title', 'v.image', 'v.processing_fee', 'v.visa_fee', 'v.max_validity', 'v.slug')
                .where((qb) => {
                qb.andWhere('v.is_deleted', query.is_deleted);
                qb.andWhere('v.source_id', query.source_id);
                qb.andWhere('v.source_type', constants_1.SOURCE_AGENT);
                qb.andWhere('v.country_id', query.country_id);
                qb.andWhere('v.visa_type_id', query.visa_type_id);
                qb.andWhere('v.status', query.status);
                qb.andWhere((subQb) => {
                    subQb.andWhere('v.visa_for', visaConstants_1.VISA_FOR_B2C).orWhere('v.visa_for', visaConstants_1.VISA_FOR_BOTH);
                });
            });
        });
    }
    getAgentB2CSingleVisa(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa as v')
                .withSchema(this.SERVICE_SCHEMA)
                .select('v.id', 'c.nice_name as country_name', 'v.title', 'v.visa_fee', 'v.processing_fee', 'v.max_validity', 'v.stay_validity', 'vt.name as visa_type', 'vm.name as visa_mode', 'v.description', 'v.documents_details', 'v.required_fields', 'v.image', 'v.meta_title', 'v.meta_description')
                .leftJoin('visa_type as vt', 'vt.id', 'v.visa_type_id')
                .leftJoin('visa_mode as vm', 'vm.id', 'v.visa_mode_id')
                .joinRaw(`LEFT JOIN public.country AS c ON v.country_id = c.id`)
                .where((qb) => {
                qb.andWhere('v.is_deleted', query.is_deleted);
                qb.andWhere('v.source_id', query.source_id);
                qb.andWhere('v.source_type', constants_1.SOURCE_AGENT);
                qb.andWhere('v.slug', query.slug);
                qb.andWhere('v.status', query.status);
            })
                .first();
        });
    }
}
exports.default = VisaModel;
