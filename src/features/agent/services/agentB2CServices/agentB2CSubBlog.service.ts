import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import { SOURCE_AGENT } from '../../../../utils/miscellaneous/constants';
import { ICreateBlogPayloadReqBody } from '../../utils/types/agentB2CSubTypes/agentB2CSubBlog.types';
import { ICreateBlogPayload } from '../../../../utils/modelTypes/blogModelTypes/blogModelTypes';

export class AgentB2CSubBlogService extends AbstractServices {
  constructor() {
    super();
  }

  public async createBlog(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;
      const { slug, ...restPayload } = req.body as ICreateBlogPayloadReqBody;
      const files = (req.files as Express.Multer.File[]) || [];
      const blogModel = this.Model.BlogModel(trx);

      const check_slug = await blogModel.getSingleBlogPost({
        slug: slug,
        source_id: agency_id,
        source_type: SOURCE_AGENT,
        is_deleted: false,
      });

      if (check_slug) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: this.ResMsg.SLUG_EXISTS,
        };
      }

      const coverImage = files?.find(
        (file) => file.fieldname === 'cover_image'
      );

      if (!coverImage) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Cover image is required',
        };
      }

      const payload: ICreateBlogPayload = {
        ...restPayload,
        slug: slug,
        source_type: SOURCE_AGENT,
        source_id: agency_id,
        created_by: user_id,
        cover_image: coverImage.filename,
      };

      await blogModel.createBlog(payload);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Blog post created successfully',
      };
    });
  }

  public async getBlogList(req: Request) {
    const { agency_id } = req.agencyUser;
    const model = this.Model.BlogModel();

    const { limit, skip, status, filter } = req.query as unknown as {
      limit: number;
      skip: number;
      status: boolean;
      filter: string;
    };

    const { data, total } = await model.getBlogList({
      limit,
      skip,
      filter,
      status,
      is_deleted: false,
      source_id: agency_id,
      source_type: SOURCE_AGENT,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  public async getSingleBlog(req: Request) {
    const { id } = req.params;
    const { agency_id } = req.agencyUser;
    const model = this.Model.BlogModel();

    const data = await model.getSingleBlogPost({
      blog_id: Number(id),
      is_deleted: false,
      source_id: agency_id,
      source_type: SOURCE_AGENT,
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
  }

  public async updateBlog(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const { agency_id } = req.agencyUser;
      const { slug, ...payload } = req.body;
      const files = req.files as Express.Multer.File[] | undefined;
      const blogModel = this.Model.BlogModel(trx);

      const blogPost = await blogModel.getSingleBlogPost({
        blog_id: Number(id),
        is_deleted: false,
        source_id: agency_id,
        source_type: SOURCE_AGENT,
      });

      if (!blogPost) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (slug && slug !== blogPost.slug) {
        const existingSlug = await blogModel.getSingleBlogPost({
          slug,
          source_id: agency_id,
          source_type: SOURCE_AGENT,
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

      const coverImage = files?.find(
        (file) => file.fieldname === 'cover_image'
      );
      if (coverImage) {
        payload.cover_image = coverImage.filename;
        if (blogPost.cover_image) {
          await this.manageFile.deleteFromCloud([blogPost.cover_image]);
        }
      }

      if (Object.keys(payload).length > 0) {
        await blogModel.updateBlog(payload, Number(id));
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Blog post updated successfully',
      };
    });
  }

  public async deleteBlog(req: Request) {
    const { id: blog_id } = req.params;
    const { agency_id } = req.agencyUser;

    const model = this.Model.BlogModel();

    const data = await model.getSingleBlogPost({
      blog_id: Number(blog_id),
      is_deleted: false,
      source_id: agency_id,
      source_type: SOURCE_AGENT,
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    await model.updateBlog({ is_deleted: true }, Number(blog_id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Blog post deleted successfully',
    };
  }
}
