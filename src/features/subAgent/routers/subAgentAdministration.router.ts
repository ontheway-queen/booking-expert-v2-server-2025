import AbstractRouter from '../../../abstract/abstract.router';
import SubAgentAdministrationController from '../controllers/subAgentAdministration.controller';

export default class SubAgentAdministrationRouter extends AbstractRouter {
  private controller = new SubAgentAdministrationController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/users')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER, ['photo']),
        this.controller.createUser
      )
      .get(this.controller.getAllAgencyUsers);

    this.router
      .route('/users/:id')
      .get(this.controller.getSingleAgencyUser)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER, ['photo']),
        this.controller.updateAgencyUser
      );

    this.router
      .route('/role')
      .post(this.controller.createRole)
      .get(this.controller.getRoleList);

    this.router.route('/permissions').get(this.controller.getPermissionsList);

    this.router
      .route('/role/:id/permissions')
      .get(this.controller.getSingleRoleWithPermissions)
      .patch(this.controller.updateRolePermissions);
  }
}
