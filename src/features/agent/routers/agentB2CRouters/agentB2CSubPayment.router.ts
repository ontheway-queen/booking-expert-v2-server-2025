import AbstractRouter from '../../../../abstract/abstract.router';
import { AgentB2CSubPaymentController } from '../../controllers/agentB2CControllers/agentB2CSubPayment.controller';

export default class AgentB2CSubPaymentRouter extends AbstractRouter {
  private controller = new AgentB2CSubPaymentController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/deposit').get(this.controller.getDepositRequestList);

    this.router
      .route('/deposit/:id')
      .get(this.controller.getSingleDepositRequest)
      .patch(this.controller.updateDepositRequest);
  }
}
