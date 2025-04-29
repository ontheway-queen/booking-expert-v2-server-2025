import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import {
  IAdminAgentGetAgencyReqQuery,
  IAdminAgentUpdateAgencyReqBody,
  IAdminAgentUpdateAgencyApplicationReqBody,
} from '../../utils/types/adminAgentTypes/adminAgentAgency.types';
import CustomError from '../../../../utils/lib/customError';
import { IUpdateAgencyPayload } from '../../../../utils/modelTypes/agentModel/agencyModelTypes';
import { v4 as uuidv4 } from 'uuid';
import { ITokenParseAgencyUser } from '../../../public/utils/types/publicCommon.types';
import Lib from '../../../../utils/lib/lib';
import config from '../../../../config/config';
import {
  MARKUP_SET_TYPE_FLIGHT,
  MARKUP_SET_TYPE_HOTEL,
} from '../../../../utils/miscellaneous/constants';

export default class AdminAgentAgencyService extends AbstractServices {
  constructor() {
    super();
  }

  public async getAgency(req: Request) {
    const query = req.query as unknown as IAdminAgentGetAgencyReqQuery;
    const AgencyModel = this.Model.AgencyModel();

    const data = await AgencyModel.getAgencyList(query, true);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: data.data,
      total: data.total,
    };
  }

  public async getSingleAgency(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const agency_id = Number(id);
      const AgencyModel = this.Model.AgencyModel(trx);

      const data = await AgencyModel.getSingleAgency(agency_id);

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      let whiteLabelPermissions = {
        flight: false,
        hotel: false,
        visa: false,
        holiday: false,
        umrah: false,
        group_fare: false,
        blog: false,
        token: '',
      };

      if (data.white_label) {
        const wPermissions = await AgencyModel.getWhiteLabelPermission(
          agency_id
        );

        if (wPermissions) {
          whiteLabelPermissions = wPermissions;
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { ...data, whiteLabelPermissions },
      };
    });
  }

  public async updateAgency(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const agency_id = Number(id);
      const AgentModel = this.Model.AgencyModel(trx);
      const checkAgency = await AgentModel.checkAgency({
        agency_id,
      });

      if (!checkAgency) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND
        );
      }

      if (
        checkAgency.status === 'Incomplete' ||
        checkAgency.status === 'Pending' ||
        checkAgency.status === 'Rejected'
      ) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND
        );
      }
      const { user_id } = req.admin;
      const { white_label_permissions, ...restBody } =
        req.body as IAdminAgentUpdateAgencyReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      const payload: IUpdateAgencyPayload = { ...restBody };

      files.forEach((file) => {
        switch (file.fieldname) {
          case 'agency_logo':
            payload.agency_logo = file.filename;
            break;
          case 'civil_aviation':
            payload.civil_aviation = file.filename;
            break;
          case 'trade_license':
            payload.trade_license = file.filename;
            break;
          case 'national_id':
            payload.national_id = file.filename;
            break;
          default:
            throw new CustomError(
              'Invalid files. Please provide valid trade license, civil aviation, NID, logo.',
              this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
            );
        }
      });

      if (restBody.white_label && !white_label_permissions) {
        const checkPermission = await AgentModel.getWhiteLabelPermission(
          agency_id
        );

        if (!checkPermission) {
          const uuid = uuidv4();
          await AgentModel.createWhiteLabelPermission({
            agency_id,
            token: uuid,
            blog: false,
            flight: false,
            group_fare: false,
            holiday: false,
            hotel: false,
            umrah: false,
            visa: false,
          });
        }
      }

      if (white_label_permissions) {
        const checkPermission = await AgentModel.getWhiteLabelPermission(
          agency_id
        );

        if (checkPermission && white_label_permissions) {
          await AgentModel.updateWhiteLabelPermission(
            white_label_permissions,
            agency_id
          );
        } else {
          const uuid = uuidv4();
          await AgentModel.createWhiteLabelPermission({
            agency_id,
            token: uuid,
            ...white_label_permissions,
          });
        }
      }

      const deleteFiles: string[] = [];

      if (payload.agency_logo && checkAgency.agency_logo) {
        deleteFiles.push(checkAgency.agency_logo);
      }
      if (payload.civil_aviation && checkAgency.civil_aviation) {
        deleteFiles.push(checkAgency.civil_aviation);
      }
      if (payload.national_id && checkAgency.national_id) {
        deleteFiles.push(checkAgency.national_id);
      }
      if (payload.trade_license && checkAgency.trade_license) {
        deleteFiles.push(checkAgency.trade_license);
      }

      await AgentModel.updateAgency(payload, agency_id);

      if (deleteFiles.length) {
        await this.manageFile.deleteFromCloud(deleteFiles);
      }

      await this.insertAdminAudit(trx, {
        created_by: user_id,
        type: 'UPDATE',
        details: `Agency Updated. Data: ${JSON.stringify(payload)}`,
        payload,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async updateAgencyApplication(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const agency_id = Number(id);
      const AgentModel = this.Model.AgencyModel(trx);
      const MarkupSetModel = this.Model.MarkupSetModel(trx);
      const checkAgency = await AgentModel.checkAgency({
        agency_id,
      });

      if (!checkAgency) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND
        );
      }

      if (
        checkAgency.status === 'Active' ||
        checkAgency.status === 'Inactive'
      ) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND
        );
      }

      const body = req.body as IAdminAgentUpdateAgencyApplicationReqBody;

      let payload: IUpdateAgencyPayload = {};

      if (body.status === 'Active') {
        const checkFlightMarkupSet = await MarkupSetModel.getSingleMarkupSet({
          id: body.flight_markup_set,
          status: true,
          type: MARKUP_SET_TYPE_FLIGHT,
        });

        if (!checkFlightMarkupSet) {
          return {
            success: false,
            code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
            message: 'Invalid flight markup set.',
          };
        }
        const checkHotelMarkupSet = await MarkupSetModel.getSingleMarkupSet({
          id: body.flight_markup_set,
          status: true,
          type: MARKUP_SET_TYPE_HOTEL,
        });

        if (!checkHotelMarkupSet) {
          return {
            success: false,
            code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
            message: 'Invalid hotel markup set.',
          };
        }

        payload.status = body.status;
        payload.flight_markup_set = body.flight_markup_set;
        payload.hotel_markup_set = body.hotel_markup_set;
      } else {
        payload.status = body.status;
      }

      await AgentModel.updateAgency(payload, agency_id);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async agencyLogin(req: Request) {
    return this.db.transaction(async (trx) => {
      const { user_id } = req.admin;
      const { id: a_id } = req.params;
      const agency_id = Number(a_id);
      const AgentUserModel = this.Model.AgencyUserModel(trx);

      const checkUserAgency = await AgentUserModel.checkUser({
        agency_id,
        is_main_user: true,
      });

      if (!checkUserAgency) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const {
        status,
        email,
        id,
        username,
        name,
        photo,
        agency_status,
        phone_number,
        agency_email,
        agency_name,
        is_main_user,
      } = checkUserAgency;

      if (
        agency_status === 'Inactive' ||
        agency_status === 'Incomplete' ||
        agency_status === 'Rejected'
      ) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Unauthorized agency! Please contact with us.',
        };
      }

      if (!status) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_ACCOUNT_INACTIVE,
        };
      }

      const tokenData: ITokenParseAgencyUser = {
        user_id: id,
        username,
        user_email: email,
        name,
        agency_id,
        agency_email,
        agency_name,
        is_main_user,
        phone_number,
        photo,
      };

      const token = Lib.createToken(tokenData, config.JWT_SECRET_AGENT, '24h');

      await this.insertAdminAudit(trx, {
        created_by: user_id,
        details: `Direct login to agent panel - ${checkUserAgency.agency_name}(${checkUserAgency.agent_no}) with ${checkUserAgency.username}`,
        type: 'GET',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.LOGIN_SUCCESSFUL,
        data: {
          token,
        },
      };
    });
  }
}
