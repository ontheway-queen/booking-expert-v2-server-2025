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
class UmrahPackageModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    insertUmrahPackage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package')
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, 'id');
        });
    }
    insertUmrahPackageImage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_photos')
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload);
        });
    }
    insertPackageInclude(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_include')
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload);
        });
    }
    getUmrahPackageInclude(umrah_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_include')
                .withSchema(this.SERVICE_SCHEMA)
                .select('*')
                .where({ umrah_id });
        });
    }
    getAgentB2CUmrahPackageList(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { is_deleted = false } = query;
            return yield this.db('umrah_package')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'slug', 'thumbnail', 'title', 'duration', 'group_size', 'short_description', 'adult_price')
                .andWhere('source_type', constants_1.SOURCE_AGENT)
                .andWhere('source_id', query.source_id)
                .andWhere('is_deleted', is_deleted)
                .where((qb) => {
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
            });
        });
    }
    getUmrahPackageList(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { is_deleted = false } = query;
            const result = yield this.db('umrah_package')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'title', 'duration', 'group_size', 'short_description', 'adult_price', 'child_price', 'status', 'valid_till_date')
                .andWhere('source_type', constants_1.SOURCE_AGENT)
                .andWhere('source_id', query.source_id)
                .where((qb) => {
                qb.andWhere('is_deleted', is_deleted);
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
                if (query.filter) {
                    qb.andWhere('title', 'like', `%${query.filter}%`).orWhere('short_description', 'like', `%${query.filter}%`);
                }
            })
                .orderBy('id', 'desc')
                .limit(query.limit || 100)
                .offset(query.skip || 0);
            const total = yield this.db('umrah_package')
                .withSchema(this.SERVICE_SCHEMA)
                .count('id AS total')
                .andWhere('source_type', constants_1.SOURCE_AGENT)
                .andWhere('source_id', query.source_id)
                .where((qb) => {
                qb.andWhere('is_deleted', is_deleted);
                if (query.status !== undefined) {
                    qb.andWhere('status', query.status);
                }
                if (query.filter) {
                    qb.andWhere('title', 'like', `%${query.filter}%`).orWhere('short_description', 'like', `%${query.filter}%`);
                }
            });
            return { data: result, total: Number(total[0].total) };
        });
    }
    getSingleAgentB2CUmrahPackageDetails(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { is_deleted = false } = query;
            return yield this.db('umrah_package')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'title', 'thumbnail', 'description', 'duration', 'valid_till_date', 'group_size', 'status', 'adult_price', 'child_price', 'package_details', 'slug', 'meta_title', 'meta_description', 'package_price_details', 'package_accommodation_details', 'short_description')
                .where((qb) => {
                qb.andWhere('source_id', query.source_id);
                qb.andWhere('source_type', constants_1.SOURCE_AGENT);
                qb.andWhere('is_deleted', is_deleted);
                if (query.slug) {
                    qb.andWhere('slug', query.slug);
                }
                if (query.umrah_id) {
                    qb.andWhere('id', query.umrah_id);
                }
            })
                .first();
        });
    }
    getSingleUmrahPackage(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { is_deleted = false } = query;
            return yield this.db('umrah_package')
                .withSchema(this.SERVICE_SCHEMA)
                .select('title', 'description', 'duration', 'valid_till_date', 'group_size', 'status', 'adult_price', 'child_price', 'package_details', 'slug', 'meta_title', 'meta_description', 'umrah_for', 'package_price_details', 'package_accommodation_details', 'short_description', 'thumbnail')
                .where('id', query.umrah_id)
                .andWhere('is_deleted', is_deleted)
                .first();
        });
    }
    getSingleUmrahPackageImages(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_photos')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'image', 'image_name')
                .where('umrah_id', query.umrah_id);
        });
    }
    getSingleUmrahPackageIncludedService(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_include')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'service_name')
                .where('umrah_id', query.umrah_id);
        });
    }
    updateUmrahPackage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package')
                .withSchema(this.SERVICE_SCHEMA)
                .where('id', payload.umrah_id)
                .update(payload.data);
        });
    }
    deleteUmrahPackageImage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_photos')
                .withSchema(this.SERVICE_SCHEMA)
                .andWhere('id', payload.image_id)
                .delete();
        });
    }
    getSingleUmrahPackageImage(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_photos')
                .withSchema(this.SERVICE_SCHEMA)
                .andWhere('id', query.image_id)
                .first();
        });
    }
    deleteUmrahPackageIncludedService(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_include')
                .withSchema(this.SERVICE_SCHEMA)
                .andWhere('id', payload.id)
                .delete();
        });
    }
}
exports.default = UmrahPackageModel;
