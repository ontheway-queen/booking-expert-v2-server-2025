import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { SOURCE_AGENT } from '../../../utils/miscellaneous/constants';

export class SubAgentConfigService extends AbstractServices {
  constructor() {
    super();
  }

  public async GetHomePageData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CWhiteLabel;
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const siteConfig = await configModel.getSiteConfig({ agency_id });

      if (!siteConfig) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const {
        agency_id: no_need_agency_id,
        id,
        about_us_content,
        contact_us_content,
        about_us_thumbnail,
        contact_us_thumbnail,
        privacy_policy_content,
        updated_by,
        updated_by_name,
        terms_and_conditions_content,
        last_updated,
        ...restData
      } = siteConfig;

      const social_links = await configModel.getSocialLink({
        agency_id,
        status: true,
      });

      const popUpBanner = await configModel.getPopUpBanner({
        agency_id,
        pop_up_for: 'AGENT',
        status: true,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          site_data: restData,
          social_links,
          popup: {
            allow: popUpBanner.length ? true : false,
            pop_up_data: popUpBanner[0],
          },
        },
      };
    });
  }

  public async GetAboutUsPageData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CWhiteLabel;

      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const siteConfig = await configModel.getSiteConfig({ agency_id });

      if (!siteConfig) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { about_us_content, about_us_thumbnail } = siteConfig;

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          about_us_content,
          about_us_thumbnail,
        },
      };
    });
  }

  public async GetContactUsPageData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CWhiteLabel;

      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const siteConfig = await configModel.getSiteConfig({ agency_id });

      if (!siteConfig) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { contact_us_content, contact_us_thumbnail } = siteConfig;

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          contact_us_content,
          contact_us_thumbnail,
        },
      };
    });
  }

  public async GetPrivacyPolicyPageData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CWhiteLabel;

      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const siteConfig = await configModel.getSiteConfig({ agency_id });

      if (!siteConfig) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { privacy_policy_content } = siteConfig;

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          privacy_policy_content,
        },
      };
    });
  }

  public async GetTermsAndConditionsPageData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CWhiteLabel;

      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const siteConfig = await configModel.getSiteConfig({ agency_id });

      if (!siteConfig) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { terms_and_conditions_content } = siteConfig;

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          terms_and_conditions_content,
        },
      };
    });
  }

  public async GetAccountsData(req: Request) {
    const { agency_id } = req.agencyB2CWhiteLabel;

    const configModel = this.Model.OthersModel();
    const { data } = await configModel.getAccount({
      source_type: SOURCE_AGENT,
      source_id: agency_id,
      status: true,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
  }
}
