import AbstractRouter from '../../../../abstract/abstract.router';
import AgentB2CSubUsersController from '../../controllers/agentB2CControllers/agentB2CSubUsers.controller';

export default class AgentB2CSubUsersRouter extends AbstractRouter {
  private controller = new AgentB2CSubUsersController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/')
    .get(this.controller.getAllUsers);

    this.router.route('/:id')
    .get(this.controller.getSingleUser)
    .patch(this.controller.updateUser);
  }
}
