import AbstractRouter from '../../../abstract/abstract.router';
import AgentB2CProfileController from '../controllers/agentB2CProfile.controller';

export default class AgentB2CProfileRouter extends AbstractRouter {
  private controller = new AgentB2CProfileController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/')
      .get(this.controller.getProfile)
      .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_FILES,[
        'photo'
      ]),this.controller.updateProfile);

      this.router.route('/change-password')
      .post(this.controller.changePassword);
  }
}
