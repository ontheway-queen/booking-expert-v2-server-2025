import AbstractRouter from '../../../abstract/abstract.router';
import AdminProfileController from '../controllers/adminProfile.controller';

export default class AdminProfileRouter extends AbstractRouter {
  private controller = new AdminProfileController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .get(this.controller.getProfile)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES, ['photo']),
        this.controller.updateProfile
      );
    this.router.route('/change-password').post(this.controller.changePassword);
    this.router.route('/balance').get(this.controller.getBalance);
  }
}
