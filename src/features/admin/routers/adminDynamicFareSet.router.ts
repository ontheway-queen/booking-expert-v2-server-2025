import AbstractRouter from '../../../abstract/abstract.router';
import AdminDynamicFareSetController from '../controllers/adminDynamicFareSet.controller';

export class AdminDynamicFareSetRouter extends AbstractRouter {
  private controller = new AdminDynamicFareSetController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    this.router
      .route('/')
      .post(this.controller.createSet)
      .get(this.controller.getSets);

    this.router.route('/supplier').get(this.controller.getSupplierList);

    this.router
      .route('/:id')
      .patch(this.controller.updateSet)
      .delete(this.controller.deleteSet);
  }
}
