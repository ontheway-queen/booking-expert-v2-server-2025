import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import { IAgencyB2CSubUpdateSiteConfigReqBody } from '../../utils/types/agentB2CSubTypes/agentB2CSubSiteConfig.types';
import {
  ICreateAgencyB2CSocialLinkPayload,
  IUpdateAgencyB2CPopUpBannerPayload,
  IUpdateAgencyB2CSiteConfigPayload,
  IUpdateAgencyB2CSocialLinkPayload,
} from '../../../../utils/modelTypes/agencyB2CModelTypes/agencyB2CConfigModel.types';
import { IUpSertPopUpBannerReqBody } from '../../utils/types/agentB2CSubTypes/agentB2CSubConfig.types';

export class AgentB2CSubSiteConfigService extends AbstractServices {
  constructor() {
    super();
  }

  public async updateSiteConfig(req: Request) {
    return this.db.transaction(async (trx) => {
      const { emails, numbers, address, ...body } =
        req.body as IAgencyB2CSubUpdateSiteConfigReqBody;
      const files = (req.files as Express.Multer.File[]) || [];
      const { agency_id, user_id } = req.agencyUser;

      const AgencyB2CConfigModel = this.Model.AgencyB2CConfigModel(trx);

      const checkConfig = await AgencyB2CConfigModel.getSiteConfig({
        agency_id,
      });

      const payload: IUpdateAgencyB2CSiteConfigPayload = {
        last_updated: new Date(),
        updated_by: user_id,
        ...body,
      };

      files.forEach((file) => {
        if (file.fieldname === 'main_logo') {
          payload.main_logo = file.filename;
        }
        if (file.fieldname === 'site_thumbnail') {
          payload.site_thumbnail = file.filename;
        }
        if (file.fieldname === 'favicon') {
          payload.favicon = file.filename;
        }
      });

      if (emails) {
        payload.emails = JSON.stringify(emails);
      }

      if (numbers) {
        payload.numbers = JSON.stringify(numbers);
      }
      if (address) {
        console.log(address);
        payload.address = JSON.stringify(address);
      }

      await AgencyB2CConfigModel.updateConfig(payload, { agency_id });

      const deletedFiles: string[] = [];

      if (checkConfig?.main_logo && payload.main_logo) {
        deletedFiles.push(checkConfig.main_logo);
      }
      if (checkConfig?.favicon && payload.favicon) {
        deletedFiles.push(checkConfig.favicon);
      }
      if (checkConfig?.site_thumbnail && payload.site_thumbnail) {
        deletedFiles.push(checkConfig.site_thumbnail);
      }

      if (deletedFiles.length) {
        await this.manageFile.deleteFromCloud(deletedFiles);
      }

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: 'Updated site config data.',
        payload: JSON.stringify(payload),
        type: 'UPDATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          main_logo: payload.main_logo,
          favicon: payload.favicon,
          site_thumbnail: payload.site_thumbnail,
        },
      };
    });
  }

  public async getSiteConfigData(req: Request) {
    const { agency_id } = req.agencyUser;
    const configModel = this.Model.AgencyB2CConfigModel();
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

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: restData,
    };
  }

  public async updateAboutUsData(req: Request) {
    const body = req.body as { content?: string };
    const files = (req.files as Express.Multer.File[]) || [];
    const { agency_id, user_id } = req.agencyUser;

    const AgencyB2CConfigModel = this.Model.AgencyB2CConfigModel();

    const checkConfig = await AgencyB2CConfigModel.getSiteConfig({
      agency_id,
    });

    const payload: IUpdateAgencyB2CSiteConfigPayload = {
      last_updated: new Date(),
      updated_by: user_id,
    };

    if (body.content) {
      payload.about_us_content = body.content;
    }

    files.forEach((file) => {
      if (file.fieldname === 'thumbnail') {
        payload.about_us_thumbnail = file.filename;
      }
    });

    await AgencyB2CConfigModel.updateConfig(payload, { agency_id });

    if (payload.about_us_thumbnail && checkConfig?.about_us_thumbnail) {
      await this.manageFile.deleteFromCloud([checkConfig.about_us_thumbnail]);
    }

    await this.insertAgentAudit(undefined, {
      agency_id,
      created_by: user_id,
      details: 'Updated site config about us data.',
      payload: JSON.stringify(payload),
      type: 'UPDATE',
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        thumbnail: payload.about_us_thumbnail,
      },
    };
  }

  public async getAboutUsData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;

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
          content: about_us_content,
          thumbnail: about_us_thumbnail,
        },
      };
    });
  }

  public async updateContactUsData(req: Request) {
    const body = req.body as { content?: string };
    const files = (req.files as Express.Multer.File[]) || [];
    const { agency_id, user_id } = req.agencyUser;

    const AgencyB2CConfigModel = this.Model.AgencyB2CConfigModel();

    const checkConfig = await AgencyB2CConfigModel.getSiteConfig({
      agency_id,
    });

    const payload: IUpdateAgencyB2CSiteConfigPayload = {
      last_updated: new Date(),
      updated_by: user_id,
    };

    if (body.content) {
      payload.contact_us_content = body.content;
    }

    files.forEach((file) => {
      if (file.fieldname === 'thumbnail') {
        payload.contact_us_thumbnail = file.filename;
      }
    });

    await AgencyB2CConfigModel.updateConfig(payload, { agency_id });

    if (payload.contact_us_content && checkConfig?.contact_us_content) {
      await this.manageFile.deleteFromCloud([checkConfig.contact_us_content]);
    }

    await this.insertAgentAudit(undefined, {
      agency_id,
      created_by: user_id,
      details: 'Updated site config contact us data.',
      payload: JSON.stringify(payload),
      type: 'UPDATE',
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        thumbnail: payload.contact_us_content,
      },
    };
  }

  public async getContactUsData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;

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
          content: contact_us_content,
          thumbnail: contact_us_thumbnail,
        },
      };
    });
  }

  public async updatePrivacyPolicyData(req: Request) {
    const body = req.body as { content?: string };
    const { agency_id, user_id } = req.agencyUser;

    const AgencyB2CConfigModel = this.Model.AgencyB2CConfigModel();

    const payload: IUpdateAgencyB2CSiteConfigPayload = {
      last_updated: new Date(),
      updated_by: user_id,
    };

    if (body.content) {
      payload.privacy_policy_content = body.content;
    }

    await AgencyB2CConfigModel.updateConfig(payload, { agency_id });

    await this.insertAgentAudit(undefined, {
      agency_id,
      created_by: user_id,
      details: 'Updated site config privacy policy data.',
      payload: JSON.stringify(payload),
      type: 'UPDATE',
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  public async getPrivacyPolicyData(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;

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
          content: privacy_policy_content,
        },
      };
    });
  }

  public async updateTermsAndConditions(req: Request) {
    const body = req.body as { content?: string };
    const { agency_id, user_id } = req.agencyUser;

    const AgencyB2CConfigModel = this.Model.AgencyB2CConfigModel();

    const payload: IUpdateAgencyB2CSiteConfigPayload = {
      last_updated: new Date(),
      updated_by: user_id,
    };

    if (body.content) {
      payload.terms_and_conditions_content = body.content;
    }

    await AgencyB2CConfigModel.updateConfig(payload, { agency_id });

    await this.insertAgentAudit(undefined, {
      agency_id,
      created_by: user_id,
      details: 'Updated site config terms and conditions data.',
      payload: JSON.stringify(payload),
      type: 'UPDATE',
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  public async getTermsAndConditionsData(req: Request) {
    const { agency_id } = req.agencyUser;

    const configModel = this.Model.AgencyB2CConfigModel();
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
        content: terms_and_conditions_content,
      },
    };
  }

  public async getSocialLinks(req: Request) {
    const configModel = this.Model.AgencyB2CConfigModel();
    const { agency_id } = req.agencyUser;

    const social_links = await configModel.getSocialLink({
      agency_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: social_links,
    };
  }

  public async deleteSocialLinks(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const { agency_id, user_id } = req.agencyUser;
      const id = Number(req.params.id);

      const check = await configModel.checkSocialLink({ agency_id, id });

      if (!check) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await configModel.deleteSocialLink({ agency_id, id });

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Deleted social media link [${check.media}(${check.link})]`,
        type: 'DELETE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async createSocialLinks(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const CommonModel = this.Model.CommonModel(trx);
      const { agency_id, user_id } = req.agencyUser;

      const body = req.body as {
        social_media_id: number;
        link: string;
      };

      const socialMedia = await CommonModel.checkSocialMedia(
        body.social_media_id
      );

      if (!socialMedia) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Social media not found',
        };
      }

      const lastNo = await configModel.getSocialLinkLastNo({ agency_id });

      const payload: ICreateAgencyB2CSocialLinkPayload = {
        agency_id,
        order_number: lastNo?.order_number ? lastNo.order_number + 1 : 1,
        link: body.link,
        social_media_id: body.social_media_id,
      };

      const newSocialMedia = await configModel.insertSocialLink(payload);

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Created new social link.`,
        payload: JSON.stringify(payload),
        type: 'CREATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: {
          id: newSocialMedia[0].id,
        },
      };
    });
  }

  public async updateSocialLinks(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const { agency_id, user_id } = req.agencyUser;

      const id = Number(req.params.id);
      const check = await configModel.checkSocialLink({ agency_id, id });

      if (!check) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const body = req.body as {
        media?: string;
        link?: string;
        status?: boolean;
        order_number?: number;
      };

      const payload: IUpdateAgencyB2CSocialLinkPayload = body;

      await configModel.updateSocialLink(payload, { agency_id, id });

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Updated Social link(${id}).`,
        payload: JSON.stringify(payload),
        type: 'UPDATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  public async getPopUpBanner(req: Request) {
    const configModel = this.Model.AgencyB2CConfigModel();
    const { agency_id } = req.agencyUser;

    const popUpBanners = await configModel.getPopUpBanner({ agency_id });

    const b2cPopUp = popUpBanners.find((banner) => banner.pop_up_for === 'B2C');

    const agentPopUp = popUpBanners.find(
      (banner) => banner.pop_up_for === 'AGENT'
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        agent: agentPopUp,
        b2c: b2cPopUp,
      },
    };
  }

  public async upSertPopUpBanner(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const { agency_id, user_id } = req.agencyUser;

      const { pop_up_for, ...restBody } = req.body as IUpSertPopUpBannerReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      const payload: IUpdateAgencyB2CPopUpBannerPayload = restBody;

      if (files.length) {
        payload.thumbnail = files[0].filename;
      }

      const checkPopUp = await configModel.getPopUpBanner({
        agency_id,
        pop_up_for: pop_up_for,
      });

      let auditDesc = '';

      if (checkPopUp.length) {
        await configModel.updatePopUpBanner(payload, { agency_id, pop_up_for });
        auditDesc = 'Created new pop up banner for ' + pop_up_for;
      } else {
        await configModel.insertPopUpBanner({
          ...payload,
          pop_up_for,
          agency_id,
        });
        auditDesc = 'Updated ' + pop_up_for + ' Pop up banner.';
      }

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: auditDesc,
        payload: JSON.stringify(payload),
        type: 'UPDATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          thumbnail: payload.thumbnail,
        },
      };
    });
  }
}
