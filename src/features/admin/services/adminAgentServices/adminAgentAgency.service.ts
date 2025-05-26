import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import {
  IAdminAgentGetAgencyReqQuery,
  IAdminAgentUpdateAgencyReqBody,
  IAdminAgentUpdateAgencyApplicationReqBody,
  IAdminCreateAgentReqBody,
} from '../../utils/types/adminAgentTypes/adminAgentAgency.types';
import CustomError from '../../../../utils/lib/customError';
import { IUpdateAgencyPayload } from '../../../../utils/modelTypes/agentModel/agencyModelTypes';
import { v4 as uuidv4 } from 'uuid';
import { ITokenParseAgencyUser } from '../../../public/utils/types/publicCommon.types';
import Lib from '../../../../utils/lib/lib';
import config from '../../../../config/config';
import {
  GENERATE_AUTO_UNIQUE_ID,
  MARKUP_SET_TYPE_FLIGHT,
  MARKUP_SET_TYPE_HOTEL,
} from '../../../../utils/miscellaneous/constants';
import EmailSendLib from '../../../../utils/lib/emailSendLib';
import { registrationVerificationCompletedTemplate } from '../../../../utils/templates/registrationVerificationCompletedTemplate';

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
          { agency_id }
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
          {agency_id}
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
          {agency_id}
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

      if (Object.keys(payload).length) {
        await AgentModel.updateAgency(payload, agency_id);
      }

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
          id: body.hotel_markup_set,
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
        ref_id,
        agency_logo,
        address
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
        ref_id,
        address,
        agency_logo
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

  public async createAgency(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id } = req.admin;

      const body = req.body as IAdminCreateAgentReqBody;
      const { white_label_permissions, user_name, ...rest } = body;

      const agencyModel = this.Model.AgencyModel(trx);
      const agencyUserModel = this.Model.AgencyUserModel(trx);

      const checkSubAgentName = await agencyModel.checkAgency({
        name: body.agency_name
      });

      if (checkSubAgentName) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Duplicate agency name! Agency already exists with this name"
        };
      }

      const checkAgentUser = await agencyUserModel.checkUser({
        email: body.email
      });

      if (checkAgentUser) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Email already exists. Please use another email"
        }
      }

      let agency_logo = '';
      let civil_aviation = '';
      let trade_license = '';
      let national_id = '';

      const files = (req.files as Express.Multer.File[]) || [];
      files.forEach((file) => {
        switch (file.fieldname) {
          case 'agency_logo':
            agency_logo = file.filename;
            break;
          case 'civil_aviation':
            civil_aviation = file.filename;
            break;
          case 'trade_license':
            trade_license = file.filename;
            break;
          case 'national_id':
            national_id = file.filename;
            break;
          default:
            throw new CustomError(
              'Invalid files. Please provide valid trade license, civil aviation, NID, logo',
              this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
            );
        }
      });

      const agent_no = await Lib.generateNo({ trx, type: GENERATE_AUTO_UNIQUE_ID.agent });

      const newAgency = await agencyModel.createAgency({
        status: 'Active',
        agent_no: agent_no,
        agency_logo,
        civil_aviation,
        trade_license,
        national_id,
        created_by: user_id,
        ...rest
      });

      const newRole = await agencyUserModel.createRole({
        agency_id: newAgency[0].id,
        name: 'Super Admin',
        is_main_role: true
      });

      let username = Lib.generateUsername(body.user_name);

      let suffix = 1;

      while (await agencyUserModel.checkUser({ username })) {
        username = `${username}${suffix}`;
        suffix += 1;
      }

      const password = Lib.generateRandomPassword(8);
      const hashed_password = await Lib.hashValue(password);

      const newUser = await agencyUserModel.createUser({
        agency_id: newAgency[0].id,
        email: body.email,
        hashed_password,
        is_main_user: true,
        name: body.user_name,
        phone_number: body.phone,
        role_id: newRole[0].id,
        username
      });

      if (body.white_label && !white_label_permissions) {
        const checkPermission = await agencyModel.getWhiteLabelPermission(
          newAgency[0].id
        );

        if (!checkPermission) {
          const uuid = uuidv4();
          await agencyModel.createWhiteLabelPermission({
            agency_id: newAgency[0].id,
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
        const checkPermission = await agencyModel.getWhiteLabelPermission(
          newAgency[0].id
        );

        if (checkPermission && white_label_permissions) {
          await agencyModel.updateWhiteLabelPermission(
            white_label_permissions,
            newAgency[0].id
          );
        } else {
          const uuid = uuidv4();
          await agencyModel.createWhiteLabelPermission({
            agency_id: newAgency[0].id,
            token: uuid,
            ...white_label_permissions,
          });
        }
      }


      await EmailSendLib.sendEmail({
        email: body.email,
        emailSub: `Booking Expert Agency Credentials`,
        emailBody: registrationVerificationCompletedTemplate(
          body.agency_name,
          {
            email: body.email,
            password: password
          }
        )
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Agent has been created",
        data: {
          agency_id: newAgency[0].id,
          user_id: newUser[0].id,
          agency_logo,
          civil_aviation,
          trade_license,
          national_id
        }
      }
    });
  }
}
