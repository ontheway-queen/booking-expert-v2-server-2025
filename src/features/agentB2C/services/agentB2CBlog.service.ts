import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';

export class AgentB2CBlogService extends AbstractServices {
  //get blog list
  public async getBlogList(req: Request) {
    const { agency_id } = req.agencyB2CWhiteLabel;

    const blogModel = this.Model.BlogModel();

    const blogPosts = await blogModel.getAgentB2CBlogList({
      is_deleted: false,
      source_id: agency_id,
      status: true,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: blogPosts,
    };
  }

  //get single blog
  public async getSingleBlog(req: Request) {
    const { slug } = req.params;
    const { agency_id } = req.agencyB2CWhiteLabel;

    const blogModel = this.Model.BlogModel();

    const blogPost = await blogModel.getSingleAgentB2CBlog({
      slug,
      is_deleted: false,
      status: true,
      source_id: agency_id,
    });

    if (!blogPost) {
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
      data: blogPost,
    };
  }
}
