import AbstractRouter from '../../../abstract/abstract.router';
import AgentPaymentsController from '../controllers/agentPayments.controller';

export default class AgentPaymentsRouter extends AbstractRouter {
  private controller = new AgentPaymentsController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {

    this.router.route('/top-up')
    .post(this.controller.topUpUsingPaymentGateway);
  }
}
