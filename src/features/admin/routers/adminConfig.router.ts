import AbstractRouter from '../../../abstract/abstract.router';
import AdminConfigController from '../controllers/adminConfig.controller';

export default class AdminConfigRouter extends AbstractRouter {
  private controller = new AdminConfigController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {

    //check slug
    this.router.route('/check-slug')
      .get(this.controller.checkSlug);
  }
}
