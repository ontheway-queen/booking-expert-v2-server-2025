import AbstractRouter from '../../../abstract/abstract.router';
import B2CProfileController from '../controllers/b2cProfile.controller';

export default class B2CProfileRouter extends AbstractRouter {
  private controller = new B2CProfileController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .get(this.controller.getProfile)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.B2C_USER_FILES),
        this.controller.updateProfile
      );

    this.router.route('/change-password').post(this.controller.changePassword);
  }
}
