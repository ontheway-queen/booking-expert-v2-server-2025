import AbstractRouter from '../../../abstract/abstract.router';
import AdminMarkupSetController from '../controllers/adminMarkupSet.controller';

export default class AdminMarkupSetRouter extends AbstractRouter {
  private controller = new AdminMarkupSetController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //flight routers
    this.router.post('/flight', this.controller.createCommissionSet);
  }
}
