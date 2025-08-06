import AbstractRouter from '../../../../abstract/abstract.router';
import { AgentB2CSubBlogController } from '../../controllers/agentB2CControllers/agentB2CSubBlog.controller';

export default class AgentB2CSubBlogRouter extends AbstractRouter {
  private controller = new AgentB2CSubBlogController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENT_BLOG_FILES),
        this.controller.createBlog
      )
      .get(this.controller.getBlogList);

    this.router
      .route('/:id')
      .get(this.controller.getSingleBlog)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENT_BLOG_FILES),
        this.controller.updateBlog
      )
      .delete(this.controller.deleteBlog);
  }
}
