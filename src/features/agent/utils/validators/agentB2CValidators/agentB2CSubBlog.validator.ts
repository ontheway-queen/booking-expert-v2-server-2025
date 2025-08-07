import Joi from 'joi';

export class AgentB2CSubBlogValidator {
  public createBlogSchema = Joi.object({
    title: Joi.string().max(200).required().messages({
      'string.base': 'Enter valid title',
      'string.max': 'Title must be less than 200 characters',
      'any.required': 'Title is required',
    }),
    summary: Joi.string().max(300).optional().messages({
      'string.base': 'Enter valid summary',
      'string.max': 'Summary must be less than 300 characters',
    }),
    content: Joi.string().required().messages({
      'string.base': 'Enter valid content',
      'any.required': 'Content is required',
      'string.empty': 'Content is empty',
    }),
    slug: Joi.string().max(100).required().messages({
      'string.base': 'Enter valid slug',
      'string.max': 'Slug must be less than 100 characters',
      'any.required': 'Slug is required',
    }),
    meta_title: Joi.string().max(60).required().messages({
      'string.base': 'Enter valid meta title',
      'string.max': 'Meta title must be less than 60 characters',
      'any.required': 'Meta title is required',
    }),
    meta_description: Joi.string().max(160).required().messages({
      'string.base': 'Enter valid meta description',
      'string.max': 'Meta description must be less than 160 characters',
      'any.required': 'Meta description is required',
    }),
    blog_for: Joi.string().valid('AGENT', 'B2C', 'BOTH').required().messages({
      'string.base': 'Enter valid blog for',
      'any.required': 'Blog for is required',
    }),
  });

  public getBlogListQuerySchema = Joi.object({
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    status: Joi.boolean().optional(),
    filter: Joi.string().optional(),
  });

  public updateBlogSchema = Joi.object({
    title: Joi.string().max(200).optional().messages({
      'string.base': 'Enter valid title',
      'string.max': 'Title must be less than 200 characters',
    }),
    summary: Joi.string().max(300).optional().messages({
      'string.base': 'Enter valid summary',
      'string.max': 'Summary must be less than 300 characters',
    }),
    content: Joi.string().max(3000).optional().messages({
      'string.base': 'Enter valid content',
      'string.empty': 'Content is empty',
    }),
    slug: Joi.string().max(100).optional().messages({
      'string.base': 'Enter valid slug',
      'string.max': 'Slug must be less than 100 characters',
    }),
    meta_title: Joi.string().max(60).optional().messages({
      'string.base': 'Enter valid meta title',
      'string.max': 'Meta title must be less than 60 characters',
    }),
    meta_description: Joi.string().max(160).optional().messages({
      'string.base': 'Enter valid meta description',
      'string.max': 'Meta description must be less than 160 characters',
    }),
    blog_for: Joi.string().valid('AGENT', 'B2C', 'BOTH').optional().messages({
      'string.base': 'Enter valid blog for',
    }),
    status: Joi.boolean().optional().messages({
      'string.base': 'Enter valid status',
    }),
  });
}
