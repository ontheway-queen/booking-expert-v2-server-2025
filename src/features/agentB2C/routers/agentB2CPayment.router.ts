import AbstractRouter from '../../../abstract/abstract.router';
import AgentB2CPaymentController from '../controllers/agentB2CPayment.controller';

export default class AgentB2CPaymentRouter extends AbstractRouter {
  private controller = new AgentB2CPaymentController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/deposit')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_DEPOSIT_FILES),
        this.controller.createDepositRequest
      )
      .get(this.controller.getDepositRequest)
      .delete(this.controller.cancelCurrentDepositRequest);

    this.router
      .route('/deposit/:id')
      .get(this.controller.getSingleDepositRequest);

    this.router.route('/ledger').get(this.controller.getLedger);

    this.router.route('/invoice').get(this.controller.getInvoices);

    this.router
      .route('/invoice/:id')
      .get(this.controller.getSingleInvoice)
      .post(this.controller.clearDueOfInvoice);
  }
}
