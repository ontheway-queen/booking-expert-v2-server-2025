import AbstractRouter from '../../../../abstract/abstract.router';
import { AgentSubAgentPaymentController } from '../../controllers/agentSubAgentControllers/agentSubAgentPayment.controller';

export default class AgentSubAgentPaymentRouter extends AbstractRouter {
  private controller = new AgentSubAgentPaymentController();
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

    this.router.route('/ledger').get(this.controller.getLedger);

    this.router
      .route('/balance-adjustment')
      .post(this.controller.balanceAdjust);
  }
}
