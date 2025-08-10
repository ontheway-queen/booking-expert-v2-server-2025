"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentB2CSubBlogValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AgentB2CSubBlogValidator {
    constructor() {
        this.createBlogSchema = joi_1.default.object({
            title: joi_1.default.string().max(200).required().messages({
                'string.base': 'Enter valid title',
                'string.max': 'Title must be less than 200 characters',
                'any.required': 'Title is required',
            }),
            summary: joi_1.default.string().max(300).optional().messages({
                'string.base': 'Enter valid summary',
                'string.max': 'Summary must be less than 300 characters',
            }),
            content: joi_1.default.string().required().messages({
                'string.base': 'Enter valid content',
                'any.required': 'Content is required',
                'string.empty': 'Content is empty',
            }),
            slug: joi_1.default.string().max(100).required().messages({
                'string.base': 'Enter valid slug',
                'string.max': 'Slug must be less than 100 characters',
                'any.required': 'Slug is required',
            }),
            meta_title: joi_1.default.string().max(60).required().messages({
                'string.base': 'Enter valid meta title',
                'string.max': 'Meta title must be less than 60 characters',
                'any.required': 'Meta title is required',
            }),
            meta_description: joi_1.default.string().max(160).required().messages({
                'string.base': 'Enter valid meta description',
                'string.max': 'Meta description must be less than 160 characters',
                'any.required': 'Meta description is required',
            }),
            blog_for: joi_1.default.string().valid('AGENT', 'B2C', 'BOTH').required().messages({
                'string.base': 'Enter valid blog for',
                'any.required': 'Blog for is required',
            }),
        });
        this.getBlogListQuerySchema = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            status: joi_1.default.boolean().optional(),
            filter: joi_1.default.string().optional(),
        });
        this.updateBlogSchema = joi_1.default.object({
            title: joi_1.default.string().max(200).optional().messages({
                'string.base': 'Enter valid title',
                'string.max': 'Title must be less than 200 characters',
            }),
            summary: joi_1.default.string().max(300).optional().messages({
                'string.base': 'Enter valid summary',
                'string.max': 'Summary must be less than 300 characters',
            }),
            content: joi_1.default.string().max(3000).optional().messages({
                'string.base': 'Enter valid content',
                'string.empty': 'Content is empty',
            }),
            slug: joi_1.default.string().max(100).optional().messages({
                'string.base': 'Enter valid slug',
                'string.max': 'Slug must be less than 100 characters',
            }),
            meta_title: joi_1.default.string().max(60).optional().messages({
                'string.base': 'Enter valid meta title',
                'string.max': 'Meta title must be less than 60 characters',
            }),
            meta_description: joi_1.default.string().max(160).optional().messages({
                'string.base': 'Enter valid meta description',
                'string.max': 'Meta description must be less than 160 characters',
            }),
            blog_for: joi_1.default.string().valid('AGENT', 'B2C', 'BOTH').optional().messages({
                'string.base': 'Enter valid blog for',
            }),
            status: joi_1.default.boolean().optional().messages({
                'string.base': 'Enter valid status',
            }),
        });
    }
}
exports.AgentB2CSubBlogValidator = AgentB2CSubBlogValidator;
