import AbstractRouter from '../../../abstract/abstract.router';
import SubAgentProfileController from '../controllers/subAgentProfile.controller';

export default class SubAgentProfileRouter extends AbstractRouter {
  private controller = new SubAgentProfileController();
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
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER, ['photo']),
        this.controller.updateProfile
      );

    // Change Password
    this.router.route('/change-password').post(this.controller.changePassword);

    this.router.route('/dashboard').get(this.controller.getDashboardData);

    this.router.route('/search').get(this.controller.searchData);
  }
}
