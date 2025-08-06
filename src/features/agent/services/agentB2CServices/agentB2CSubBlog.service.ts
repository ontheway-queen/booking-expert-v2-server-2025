import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import { SOURCE_AGENT } from '../../../../utils/miscellaneous/constants';

export class AgentB2CSubBlogService extends AbstractServices {
  public async createBlog(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;
      const { slug, ...payload } = req.body;
      const file = (req.files as Express.Multer.File[]) || [];
      const model = this.Model.BlogModel(trx);

      const check_slug = await model.getSingleBlogPost({
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

      if (file?.length && file[0]?.fieldname === 'cover_image') {
        payload.cover_image = file[0].filename;
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Cover image is required',
        };
      }

      (payload.slug = slug),
        (payload.source_type = SOURCE_AGENT),
        (payload.source_id = agency_id),
        (payload.created_by = user_id);

      await model.createBlog(payload);

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
      const file = (req.files as Express.Multer.File[]) || [];
      const model = this.Model.BlogModel(trx);


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

      if (slug) {
        const check_slug = await model.getSingleBlogPost({
          slug: slug,
          source_id: agency_id,
          source_type: SOURCE_AGENT,
          is_deleted: false,
        });

        if (check_slug && check_slug.id !== Number(id)) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: this.ResMsg.SLUG_EXISTS,
          };
        }
      }

      if (file?.length && file[0]?.fieldname === 'cover_image') {
        payload.cover_image = file[0].filename;
        await this.manageFile.deleteFromCloud([data.cover_image]);
      }


      if (payload && Object.keys(payload).length) {
        await model.updateBlog(payload, Number(id));
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

    console.log({ data });

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
