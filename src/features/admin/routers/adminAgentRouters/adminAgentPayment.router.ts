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
    this.router.route('/deposit').get(this.controller.getDepositRequestList);
    this.router.route('/deposit/:id')
      .get(this.controller.getSingleDepositRequest)
      .patch(this.controller.updateDepositRequest);
    this.router.route('/balance').post(this.controller.adjustBalance);

    this.router.route('/adm')
    .post(this.controller.createADM)
    .get(this.controller.getADMList);

    this.router.route('/adm/:id')
    .get(this.controller.getSingleADM)
    .patch(this.controller.updateADM)
    .delete(this.controller.deleteADM);
    
  }
}
