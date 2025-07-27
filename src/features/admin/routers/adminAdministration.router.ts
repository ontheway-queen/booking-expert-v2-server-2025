import AbstractRouter from '../../../abstract/abstract.router';
import AdminAdministrationController from '../controllers/adminAdministration.controller';

export default class AdminAdministrationRouter extends AbstractRouter {
  private controller = new AdminAdministrationController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/admin')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES, ['photo']),
        this.controller.createAdmin
      )
      .get(this.controller.getAllAdmin);

    this.router
      .route('/admin/:id')
      .get(this.controller.getSingleAdmin)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES, ['photo']),
        this.controller.updateAdmin
      );

    this.router
      .route('/permissions')
      .get(this.controller.getPermissionsList)
      .post(this.controller.createPermission);

    this.router
      .route('/permissions/:id')
      .patch(this.controller.updatePermission);

    this.router
      .route('/role')
      .post(this.controller.createRole)
      .get(this.controller.getRoleList);

    this.router
      .route('/role/:id/permissions')
      .get(this.controller.getSingleRoleWithPermissions)
      .patch(this.controller.updateRolePermissions);

    this.router.route('/error-log').get(this.controller.getErrorLog);

    this.router.route('/audit-trail').get(this.controller.getAudit);
  }
}
