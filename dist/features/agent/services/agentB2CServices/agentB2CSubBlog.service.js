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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CSubBlogService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AgentB2CSubBlogService extends abstract_service_1.default {
    constructor() {
        super();
    }
    createBlog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id, user_id } = req.agencyUser;
                const _a = req.body, { slug } = _a, restPayload = __rest(_a, ["slug"]);
                const files = req.files || [];
                const blogModel = this.Model.BlogModel(trx);
                const check_slug = yield blogModel.getSingleBlogPost({
                    slug: slug,
                    source_id: agency_id,
                    source_type: constants_1.SOURCE_AGENT,
                    is_deleted: false,
                });
                if (check_slug) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.SLUG_EXISTS,
                    };
                }
                const coverImage = files === null || files === void 0 ? void 0 : files.find((file) => file.fieldname === 'cover_image');
                if (!coverImage) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Cover image is required',
                    };
                }
                const payload = Object.assign(Object.assign({}, restPayload), { slug: slug, source_type: constants_1.SOURCE_AGENT, source_id: agency_id, created_by: user_id, cover_image: coverImage.filename });
                yield blogModel.createBlog(payload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Blog post created successfully',
                };
            }));
        });
    }
    getBlogList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agencyUser;
            const model = this.Model.BlogModel();
            const { limit, skip, status, filter } = req.query;
            const { data, total } = yield model.getBlogList({
                limit,
                skip,
                filter,
                status,
                is_deleted: false,
                source_id: agency_id,
                source_type: constants_1.SOURCE_AGENT,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    getSingleBlog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { agency_id } = req.agencyUser;
            const model = this.Model.BlogModel();
            const data = yield model.getSingleBlogPost({
                blog_id: Number(id),
                is_deleted: false,
                source_id: agency_id,
                source_type: constants_1.SOURCE_AGENT,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
    updateBlog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { agency_id } = req.agencyUser;
                const _a = req.body, { slug } = _a, payload = __rest(_a, ["slug"]);
                const files = req.files;
                const blogModel = this.Model.BlogModel(trx);
                const blogPost = yield blogModel.getSingleBlogPost({
                    blog_id: Number(id),
                    is_deleted: false,
                    source_id: agency_id,
                    source_type: constants_1.SOURCE_AGENT,
                });
                if (!blogPost) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (slug && slug !== blogPost.slug) {
                    const existingSlug = yield blogModel.getSingleBlogPost({
                        slug,
                        source_id: agency_id,
                        source_type: constants_1.SOURCE_AGENT,
                        is_deleted: false,
                    });
                    if (existingSlug && existingSlug.id !== Number(id)) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: this.ResMsg.SLUG_EXISTS,
                        };
                    }
                }
                const coverImage = files === null || files === void 0 ? void 0 : files.find((file) => file.fieldname === 'cover_image');
                if (coverImage) {
                    payload.cover_image = coverImage.filename;
                    if (blogPost.cover_image) {
                        yield this.manageFile.deleteFromCloud([blogPost.cover_image]);
                    }
                }
                if (Object.keys(payload).length > 0) {
                    yield blogModel.updateBlog(payload, Number(id));
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Blog post updated successfully',
                };
            }));
        });
    }
    deleteBlog(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: blog_id } = req.params;
            const { agency_id } = req.agencyUser;
            const model = this.Model.BlogModel();
            const data = yield model.getSingleBlogPost({
                blog_id: Number(blog_id),
                is_deleted: false,
                source_id: agency_id,
                source_type: constants_1.SOURCE_AGENT,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.updateBlog({ is_deleted: true }, Number(blog_id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Blog post deleted successfully',
            };
        });
    }
}
exports.AgentB2CSubBlogService = AgentB2CSubBlogService;
