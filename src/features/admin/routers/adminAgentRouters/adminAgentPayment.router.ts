import AbstractRouter from '../../../../abstract/abstract.router';
import AdminAgentPaymentsController from '../../controllers/adminAgentControllers/adminAgentPayments.controller';

export default class AdminAgentPaymentRouter extends AbstractRouter {
  private controller = new AdminAgentPaymentsController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/loan').post(this.controller.createLoan);
    this.router.route('/loan/history').get(this.controller.loanHistory);
    this.router.route('/ledger').get(this.controller.getLedger);
  }
}
