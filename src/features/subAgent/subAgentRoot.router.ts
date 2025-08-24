import { Router } from 'express';
import SubAgentConfigRouter from './routers/subAgentConfig.router';
import SubAgentMainRouter from './routers/subAgentMain.router';

export default class SubAgentRootRouter {
  public Router = Router();
  private subAgentConfigRouter = new SubAgentConfigRouter();
  private subAgentMainRouter = new SubAgentMainRouter();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    this.Router.use('/', this.subAgentMainRouter.router);
    this.Router.use('/config', this.subAgentConfigRouter.router);
  }
}
