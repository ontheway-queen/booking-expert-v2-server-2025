import AbstractRouter from '../../../abstract/abstract.router';
import { AgentB2CVisaController } from '../controllers/agentB2CVisa.controller';

export default class AgentB2CVisaRouter extends AbstractRouter {
  private controller = new AgentB2CVisaController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {}
}
