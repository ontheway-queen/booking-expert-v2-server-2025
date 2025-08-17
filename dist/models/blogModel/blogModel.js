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
const blogConstants_1 = require("../../utils/miscellaneous/blogConstants");
const constants_1 = require("../../utils/miscellaneous/constants");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class BlogModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    createBlog(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('blog').withSchema(this.SERVICE_SCHEMA).insert(payload);
        });
    }
    getSingleBlogPost(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { is_deleted = false } = query;
            return yield this.db('blog')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'title', 'content', 'slug', 'meta_title', 'meta_description', 'cover_image', 'blog_for', 'status')
                .where((qb) => {
                qb.andWhere('source_id', query.source_id);
                qb.andWhere('source_type', query.source_type);
                qb.andWhere('is_deleted', is_deleted);
                if (query.slug) {
                    qb.andWhere('slug', query.slug);
                }
                if (query.blog_id) {
                    qb.andWhere('id', query.blog_id);
                }
            })
                .first();
        });
    }
    getBlogList(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { is_deleted = false } = query;
            const result = yield this.db('blog as b')
                .withSchema(this.SERVICE_SCHEMA)
                .select('b.id', 'b.title', 'b.summary', 'b.cover_image', 'b.status', 'b.created_at')
                .where((qb) => {
                qb.andWhere('b.source_id', query.source_id);
                qb.andWhere('b.source_type', query.source_type);
                qb.andWhere('b.is_deleted', is_deleted);
                if (query.status !== undefined) {
                    qb.andWhere('b.status', query.status);
                }
                if (query.filter) {
                    qb.andWhere('b.title', 'like', `%${query.filter}%`).orWhere('b.summary', 'like', `%${query.filter}%`);
                }
            })
                .orderBy('id', 'desc')
                .limit(query.limit || 100)
                .offset(query.skip || 0);
            const total = yield this.db('blog as b')
                .withSchema(this.SERVICE_SCHEMA)
                .count('b.id as total')
                .where((qb) => {
                qb.andWhere('b.source_id', query.source_id);
                qb.andWhere('b.source_type', query.source_type);
                qb.andWhere('b.is_deleted', is_deleted);
                if (query.status !== undefined) {
                    qb.andWhere('b.status', query.status);
                }
                if (query.filter) {
                    qb.andWhere('b.title', 'like', `%${query.filter}%`).orWhere('b.summary', 'like', `%${query.filter}%`);
                }
            });
            return { data: result, total: Number(total[0].total) };
        });
    }
    updateBlog(payload, blog_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('blog')
                .withSchema(this.SERVICE_SCHEMA)
                .update(payload)
                .where('id', blog_id);
        });
    }
    getAgentB2CBlogList(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { is_deleted = false } = query;
            return yield this.db('blog as b')
                .withSchema(this.SERVICE_SCHEMA)
                .select('b.id', 'b.title', 'b.summary', 'b.cover_image', 'b.slug', 'b.meta_title', 'b.meta_description', 'b.created_at as created_date')
                .where((qb) => {
                qb.andWhere('b.source_type', constants_1.SOURCE_AGENT);
                qb.andWhere('b.source_id', query.source_id);
                qb.andWhere('b.is_deleted', is_deleted);
                qb.andWhere((subQb) => {
                    subQb.where('b.blog_for', blogConstants_1.BLOG_FOR_B2C).orWhere('b.blog_for', blogConstants_1.BLOG_FOR_BOTH);
                });
                if (query.status !== undefined) {
                    qb.andWhere('b.status', query.status);
                }
            });
        });
    }
    getSingleAgentB2CBlog(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { is_deleted = false } = query;
            return yield this.db('services.blog as b')
                .select('b.title', 'b.summary', 'b.content', 'b.slug', 'b.meta_title', 'b.meta_description', 'b.cover_image', 'b.created_at as created_date', 'au.name as author', 'au.photo as author_photo')
                .where((qb) => {
                qb.andWhere('b.source_type', constants_1.SOURCE_AGENT);
                qb.andWhere('b.source_id', query.source_id);
                qb.andWhere('b.is_deleted', is_deleted);
                qb.andWhere((subQb) => {
                    subQb.where('b.blog_for', blogConstants_1.BLOG_FOR_B2C).orWhere('b.blog_for', blogConstants_1.BLOG_FOR_BOTH);
                });
                if (query.status !== undefined) {
                    qb.andWhere('b.status', query.status);
                }
                if (query.slug) {
                    qb.andWhere('b.slug', query.slug);
                }
            })
                .leftJoin('agent.agency_user as au', 'au.id', 'b.created_by')
                .first();
        });
    }
}
exports.default = BlogModel;
