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
class VisaApplicationModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createVisaApplication(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_application')
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, 'id');
        });
    }
    createVisaApplicationTracking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_application_tracking')
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, 'id');
        });
    }
    createVisaApplicationTraveler(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_application_traveller')
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //get agent b2c all application list
    getAgentB2CVisaApplicationList(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db('visa_application as va')
                .withSchema(this.SERVICE_SCHEMA)
                .select('va.id', 'va.application_ref', 'v.title', 'vt.name as visa_type', 'vm.name as visa_mode', 'c.nice_name as country_name', 'va.status', 'va.traveler', 'va.application_date')
                .leftJoin('visa as v', 'va.visa_id', 'v.id')
                .leftJoin('visa_type as vt', 'v.visa_type_id', 'vt.id')
                .leftJoin('visa_mode as vm', 'v.visa_mode_id', 'vm.id')
                .joinRaw(`LEFT JOIN public.country AS c ON v.country_id = c.id`)
                .where((qb) => {
                qb.andWhere('va.source_id', query.source_id);
                qb.andWhere('va.source_type', query.source_type);
                qb.andWhere('va.user_id', query.user_id);
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween('va.application_date', [
                        query.from_date,
                        query.to_date,
                    ]);
                }
                if (query.status) {
                    qb.andWhere('va.status', query.status);
                }
                if (query.filter) {
                    qb.andWhere((subQb) => {
                        subQb
                            .andWhere('va.contact_email', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.nationality', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.residence', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.contact_number', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.application_ref', 'Ilike', `%${query.filter}%`);
                    });
                }
            })
                .limit(query.limit || 100)
                .offset(query.skip || 0)
                .orderBy('va.id', 'desc');
            const total = yield this.db('visa_application as va')
                .withSchema(this.SERVICE_SCHEMA)
                .count('va.id as total')
                .where((qb) => {
                qb.andWhere('va.source_id', query.source_id);
                qb.andWhere('va.source_type', query.source_type);
                qb.andWhere('va.user_id', query.user_id);
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween('va.application_date', [
                        query.from_date,
                        query.to_date,
                    ]);
                }
                if (query.status) {
                    qb.andWhere('va.status', query.status);
                }
                if (query.filter) {
                    qb.andWhere((subQb) => {
                        subQb
                            .andWhere('va.contact_email', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.nationality', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.residence', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.contact_number', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.application_ref', 'Ilike', `%${query.filter}%`);
                    });
                }
            });
            return { data: result, total: Number(total[0].total) };
        });
    }
    // get agent b2c single application
    getAgentB2CSingleVisaApplication(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_application as va')
                .withSchema(this.SERVICE_SCHEMA)
                .select('va.id', 'v.title', 'vt.name as visa_type', 'vm.name as visa_mode', 'c.nice_name as country_name', 'va.application_ref', 'va.from_date', 'va.to_date', 'va.visa_fee', 'va.processing_fee', 'va.traveler', 'va.payable', 'va.status', 'va.application_date')
                .leftJoin('visa as v', 'va.visa_id', 'v.id')
                .leftJoin('visa_type as vt', 'v.visa_type_id', 'vt.id')
                .leftJoin('visa_mode as vm', 'v.visa_mode_id', 'vm.id')
                .joinRaw(`LEFT JOIN public.country AS c ON v.country_id = c.id`)
                .where((qb) => {
                qb.andWhere('va.source_id', query.source_id);
                qb.andWhere('va.source_type', query.source_type);
                qb.andWhere('va.id', query.id);
                qb.andWhere('va.user_id', query.user_id);
            })
                .first();
        });
    }
    //get agent b2c single application traveler
    getAgentB2CSingleVisaApplicationTraveler(query) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('application_id', query.application_id);
            return yield this.db('visa_application_traveller as vat')
                .withSchema(this.SERVICE_SCHEMA)
                .select('vat.id', 'vat.title', 'vat.type', 'vat.first_name', 'vat.last_name', 'vat.date_of_birth', 'vat.passport_number', 'vat.passport_expiry_date', 'vat.passport_type', 'vat.city', 'c.nice_name as country', 'vat.address', 'vat.required_fields')
                .joinRaw(`LEFT JOIN public.country AS c ON vat.country_id = c.id`)
                .where((qb) => {
                qb.andWhere('vat.application_id', query.application_id);
            });
        });
    }
    //get all agent b2c visa application
    getAllAgentB2CVisaApplication(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db('visa_application as va')
                .withSchema(this.SERVICE_SCHEMA)
                .select('va.id', 'va.application_ref', 'v.title', 'vt.name as visa_type', 'vm.name as visa_mode', 'c.nice_name as country_name', 'u.name as applicant_name', 'va.status', 'va.traveler', 'va.application_date')
                .leftJoin('visa as v', 'va.visa_id', 'v.id')
                .leftJoin('visa_type as vt', 'v.visa_type_id', 'vt.id')
                .leftJoin('visa_mode as vm', 'v.visa_mode_id', 'vm.id')
                .joinRaw(`LEFT JOIN public.country AS c ON v.country_id = c.id`)
                .joinRaw(`LEFT JOIN agent_b2c.users as u ON va.user_id = u.id`)
                .where((qb) => {
                var _a;
                qb.andWhere('va.source_id', query.source_id);
                qb.andWhere('va.source_type', query.source_type);
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween('va.application_date', [
                        query.from_date,
                        query.to_date,
                    ]);
                }
                if ((_a = query.status) === null || _a === void 0 ? void 0 : _a.length) {
                    qb.whereIn('va.status', query.status);
                }
                if (query.visa_id) {
                    qb.andWhere('va.visa_id', query.visa_id);
                }
                if (query.filter) {
                    qb.andWhere((subQb) => {
                        subQb
                            .andWhere('va.contact_email', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.nationality', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.residence', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.contact_number', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.application_ref', 'Ilike', `%${query.filter}%`);
                    });
                }
            })
                .limit(query.limit || 100)
                .offset(query.skip || 0)
                .orderBy('va.application_date', 'desc');
            const total = yield this.db('visa_application as va')
                .withSchema(this.SERVICE_SCHEMA)
                .count('va.id as total')
                .where((qb) => {
                var _a;
                qb.andWhere('va.source_id', query.source_id);
                qb.andWhere('va.source_type', query.source_type);
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween('va.application_date', [
                        query.from_date,
                        query.to_date,
                    ]);
                }
                console.log('query.status', query.status);
                if ((_a = query.status) === null || _a === void 0 ? void 0 : _a.length) {
                    qb.whereIn('va.status', query.status);
                }
                if (query.visa_id) {
                    qb.andWhere('va.visa_id', query.visa_id);
                }
                if (query.filter) {
                    qb.andWhere((subQb) => {
                        subQb
                            .andWhere('va.contact_email', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.nationality', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.residence', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.contact_number', 'Ilike', `%${query.filter}%`)
                            .orWhere('va.application_ref', 'Ilike', `%${query.filter}%`);
                    });
                }
            });
            return { data: result, total: Number(total[0].total) };
        });
    }
    // get agent b2c single application
    getAgentB2CSingleVisaApplicationForAgent(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_application as va')
                .withSchema(this.SERVICE_SCHEMA)
                .select('va.id', 'v.title', 'vt.name as visa_type', 'vm.name as visa_mode', 'c.nice_name as country_name', 'va.application_ref', 'u.name as applicant_name', 'va.from_date', 'va.to_date', 'va.visa_fee', 'va.processing_fee', 'va.traveler', 'va.payable', 'va.status', 'va.application_date', 'va.contact_email', 'va.contact_number', 'va.whatsapp_number', 'va.nationality', 'va.residence')
                .leftJoin('visa as v', 'va.visa_id', 'v.id')
                .leftJoin('visa_type as vt', 'v.visa_type_id', 'vt.id')
                .leftJoin('visa_mode as vm', 'v.visa_mode_id', 'vm.id')
                .joinRaw(`LEFT JOIN public.country AS c ON v.country_id = c.id`)
                .joinRaw(`LEFT JOIN agent_b2c.users as u ON va.user_id = u.id`)
                .where((qb) => {
                qb.andWhere('va.source_id', query.source_id);
                qb.andWhere('va.source_type', query.source_type);
                qb.andWhere('va.id', query.id);
            })
                .first();
        });
    }
    // update visa application
    updateVisaApplication(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_application')
                .withSchema(this.SERVICE_SCHEMA)
                .where({ id })
                .update({ status: payload.status });
        });
    }
    //get visa application tracking
    getVisaApplicationTrackingList(_a) {
        return __awaiter(this, arguments, void 0, function* ({ application_id, }) {
            return yield this.db('visa_application_tracking')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'details', 'created_at')
                .where((qb) => {
                qb.andWhere('application_id', application_id);
            });
        });
    }
}
exports.default = VisaApplicationModel;
