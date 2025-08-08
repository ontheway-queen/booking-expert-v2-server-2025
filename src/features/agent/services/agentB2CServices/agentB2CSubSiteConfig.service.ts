import { Request } from "express";
import AbstractServices from "../../../../abstract/abstract.service";
import { IAgencyB2CSubUpdateSiteConfigReqBody } from "../../utils/types/agentB2CSubTypes/agentB2CSubSiteConfig.types";
import { IUpdateAgencyB2CSiteConfigPayload } from "../../../../utils/modelTypes/agencyB2CModelTypes/agencyB2CConfigModel.types";

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
        if (file.fieldname === "main_logo") {
          payload.main_logo = file.filename;
        }
        if (file.fieldname === "site_thumbnail") {
          payload.site_thumbnail = file.filename;
        }
        if (file.fieldname === "fabicon") {
          payload.fabicon = file.filename;
        }
      });

      if (emails?.length) {
        payload.emails = JSON.stringify(emails);
      }
      if (numbers?.length) {
        payload.numbers = JSON.stringify(numbers);
      }
      if (address) {
        payload.address = JSON.stringify(address);
      }

      await AgencyB2CConfigModel.updateConfig(payload, { agency_id });

      const deletedFiles: string[] = [];

      if (checkConfig?.main_logo && payload.main_logo) {
        deletedFiles.push(checkConfig.main_logo);
      }
      if (checkConfig?.fabicon && payload.fabicon) {
        deletedFiles.push(checkConfig.fabicon);
      }
      if (checkConfig?.site_thumbnail && payload.site_thumbnail) {
        deletedFiles.push(checkConfig.site_thumbnail);
      }

      if (deletedFiles.length) {
        await this.manageFile.deleteFromCloud(deletedFiles);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          main_logo: payload.main_logo,
          fabicon: payload.fabicon,
          site_thumbnail: payload.site_thumbnail,
        },
      };
    });
  }
}
