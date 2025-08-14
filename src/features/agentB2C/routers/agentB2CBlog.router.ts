import AbstractRouter from '../../../abstract/abstract.router';
import { AgentB2CBlogController } from '../controllers/agentB2CBlog.controller';

export default class AgentB2CBlogRouter extends AbstractRouter {
  private controller = new AgentB2CBlogController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/').get(this.controller.getBlogList);

    this.router.route('/:slug').get(this.controller.getSingleBlog);
  }
}
