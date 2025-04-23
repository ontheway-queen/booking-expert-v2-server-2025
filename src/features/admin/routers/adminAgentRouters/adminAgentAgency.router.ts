import AbstractRouter from '../../../../abstract/abstract.router';
import AdminAgentAgencyController from '../../controllers/adminAgentControllers/adminAgentAgency.controller';

export default class AdminAgentAgencyRouter extends AbstractRouter {
  private controller = new AdminAgentAgencyController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.get('/', this.controller.getAgency);
    this.router.get('/:id', this.controller.getSingleAgency);
  }
}
