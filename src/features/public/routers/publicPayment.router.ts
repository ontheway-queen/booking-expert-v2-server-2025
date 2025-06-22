import AbstractRouter from '../../../abstract/abstract.router';
import { PublicPaymentController } from '../controllers/publicPayment.controller';

export class PublicPaymentRouter extends AbstractRouter {
  private controller = new PublicPaymentController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/ssl').post(this.controller.transactionUsingSSL);
  }
}
