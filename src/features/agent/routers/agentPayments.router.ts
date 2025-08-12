import AbstractRouter from '../../../abstract/abstract.router';
import AgentPaymentsController from '../controllers/agentPayments.controller';

export default class AgentPaymentsRouter extends AbstractRouter {
  private controller = new AgentPaymentsController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/deposit')
      .post(this.controller.createDepositRequest)
      .delete(this.controller.cancelCurrentDepositRequest);

    this.router
      .route('/deposit/:id')
      .get(this.controller.getSingleDepositRequest);

    this.router
      .route('/deposit/history')
      .get(this.controller.getDepositHistory);

    this.router.route('/adm/history').get(this.controller.getADMList);

    this.router.route('/loan/history').get(this.controller.getLoanHistory);

    this.router.route('/ledger').get(this.controller.getLedger);

    this.router.route('/top-up').post(this.controller.topUpUsingPaymentGateway);

    this.router.route('/invoice').get(this.controller.getInvoices);

    this.router
      .route('/invoice/:id')
      .get(this.controller.getSingleInvoice)
      .post(this.controller.clearDueOfInvoice);

    this.router.route('/partial').get(this.controller.getPartialPaymentList);

    this.router.route('/balance').get(this.controller.getAgentBalance);

    this.router.route('/accounts').get(this.controller.getAccounts);
  }
}
