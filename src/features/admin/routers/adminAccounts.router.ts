import AbstractRouter from '../../../abstract/abstract.router';
import AdminAccountsController from '../controllers/adminAccounts.controller';

export default class AdminAccountsRouter extends AbstractRouter {
  private controller = new AdminAccountsController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .get(this.controller.getAccounts)
      .post(this.controller.createAccounts);

    this.router
      .route('/:id')
      .patch(this.controller.updateAccounts)
      .delete(this.controller.deleteAccounts);
  }
}
