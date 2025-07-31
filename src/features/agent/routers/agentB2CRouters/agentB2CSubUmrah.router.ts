import AbstractRouter from '../../../../abstract/abstract.router';
import { AgentB2CSubUmrahController } from '../../controllers/agentB2CControllers/agentB2CSubUmrah.controller';

export default class AgentB2CSubUmrahRouter extends AbstractRouter {
  private controller = new AgentB2CSubUmrahController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {}
}
