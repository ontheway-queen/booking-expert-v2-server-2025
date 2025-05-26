import AbstractRouter from '../../../../abstract/abstract.router';
import AgentB2CSubConfigController from '../../controllers/agentB2CControllers/agentB2CSubConfig.controller';

export default class AgentB2CSubConfigRouter extends AbstractRouter {
  private controller = new AgentB2CSubConfigController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/markup')
      .get(this.controller.getB2CMarkup)
      .post(this.controller.upsertB2CMarkup)
  }
}
