import AbstractRouter from '../../../abstract/abstract.router';
import AdminMarkupSetController from '../controllers/adminMarkupSet.controller';

export default class AdminMarkupSetRouter extends AbstractRouter {
  private controller = new AdminMarkupSetController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {

    this.router.route('/')
      .post(this.controller.createCommissionSet)
      .get(this.controller.getMarkupSet);

    //flight routers
    this.router.route('/:id/flight')
      .get(this.controller.getSingleMarkupSet)
      .delete(this.controller.deleteMarkupSet)
      .patch(this.controller.updateMarkupSet);

    this.router.route('/:set_id/flight/api/:set_api_id')
      .get(this.controller.getMarkupSetFlightApiDetails)
      .post(this.controller.updateMarkupSetFlightApi);
  }
}
