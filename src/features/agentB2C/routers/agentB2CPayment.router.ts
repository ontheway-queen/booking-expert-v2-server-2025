import AbstractRouter from '../../../abstract/abstract.router';
import AgentB2CPaymentController from '../controllers/agentB2CPayment.controller';

export default class AgentB2CPaymentRouter extends AbstractRouter {
  private controller = new AgentB2CPaymentController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {}
}
