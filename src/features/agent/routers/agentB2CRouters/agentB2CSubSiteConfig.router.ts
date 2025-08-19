import AbstractRouter from '../../../../abstract/abstract.router';
import { AgentB2CSubSiteConfigController } from '../../controllers/agentB2CControllers/agentB2CSubSiteConfig.controller';

export default class AgentB2CSubSiteConfigRouter extends AbstractRouter {
  private controller = new AgentB2CSubSiteConfigController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .get(this.controller.getSiteConfigData)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_SITE_CONFIG, [
          'main_logo',
          'site_thumbnail',
          'favicon',
        ]),
        this.controller.updateSiteConfig
      );

    this.router
      .route('/about-us')
      .get(this.controller.getAboutUsData)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_SITE_CONFIG, [
          'thumbnail',
        ]),
        this.controller.updateAboutUsData
      );

    this.router
      .route('/contact-us')
      .get(this.controller.getContactUsData)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_B2C_SITE_CONFIG, [
          'thumbnail',
        ]),
        this.controller.updateContactUsData
      );

    this.router
      .route('/privacy-policy')
      .get(this.controller.getPrivacyPolicyData)
      .patch(this.controller.updatePrivacyPolicyData);

    this.router
      .route('/terms-and-conditions')
      .get(this.controller.getTermsAndConditionsData)
      .patch(this.controller.updateTermsAndConditions);

    this.router
      .route('/social-links')
      .get(this.controller.getSocialLinks)
      .post(this.controller.createSocialLinks);

    this.router
      .route('/social-links/:id')
      .delete(this.controller.deleteSocialLinks)
      .patch(this.controller.updateSocialLinks);

    this.router
      .route('/pop-up-banner')
      .get(this.controller.getPopUpBanner)
      .post(
        this.uploader.cloudUploadRaw(
          this.fileFolders.AGENCY_B2C_SITE_CONFIG_POP_UP,
          ['thumbnail']
        ),
        this.controller.upSertPopUpBanner
      );
  }
}
