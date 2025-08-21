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
    this.router.route('/check-slug').get(this.controller.checkSlug);

    this.router
      .route('/city')
      .get(this.controller.getAllCity)
      .post(this.controller.createCity);

    this.router
      .route('/city/:id')
      .patch(this.controller.updateCity)
      .delete(this.controller.deleteCity);

    this.router
      .route('/airport')
      .get(this.controller.getAllAirport)
      .post(this.controller.createAirport);

    this.router
      .route('/airport/:id')
      .patch(this.controller.updateAirport)
      .delete(this.controller.deleteAirport);

    this.router
      .route('/airlines')
      .get(this.controller.getAllAirlines)
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AIRLINES_FILES, ['logo']),
        this.controller.createAirlines
      );

    this.router
      .route('/airlines/:id')
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AIRLINES_FILES, ['logo']),
        this.controller.updateAirlines
      )
      .delete(this.controller.deleteAirlines);

    this.router
      .route('/b2c-markup-set')
      .get(this.controller.getB2CMarkupSet)
      .put(this.controller.updateB2CMarkupSet);

    this.router
      .route('/bank')
      .get(this.controller.getBanks)
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.BANK_LOGO, ['logo']),
        this.controller.createBank
      );

    this.router
      .route('/bank/:id')
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.BANK_LOGO, ['logo']),
        this.controller.updateBank
      );

    this.router
      .route('/social-media')
      .get(this.controller.getSocialMedia)
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.SOCIAL_MEDIA, ['logo']),
        this.controller.createSocialMedia
      );

    this.router
      .route('/social-media/:id')
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.SOCIAL_MEDIA, ['logo']),
        this.controller.updateSocialMedia
      );

    this.router
      .route('/cors-origin')
      .post(this.controller.insertCorsOrigin)
      .get(this.controller.getCorsOrigin);

    this.router
      .route('/cors-origin/:id')
      .post(this.controller.updateCorsOrigin);
  }
}
