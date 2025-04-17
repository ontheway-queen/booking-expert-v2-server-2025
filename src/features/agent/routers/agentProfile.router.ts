import AbstractRouter from '../../../abstract/abstract.router';
import AgentProfileController from '../controllers/agentProfile.controller';

export default class AgentProfileRouter extends AbstractRouter {
  private controller = new AgentProfileController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    // Profile API
    this.router
      .route('/')
      .get(this.controller.getProfile)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER),
        this.controller.updateProfile
      );

    // Change Password
    this.router.route('/change-password').post(this.controller.changePassword);
  }
}
