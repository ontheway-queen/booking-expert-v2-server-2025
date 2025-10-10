import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import {
  IAdminAgentGetAgencyReqQuery,
  IAdminAgentUpdateAgencyReqBody,
  IAdminAgentUpdateAgencyApplicationReqBody,
  IAdminCreateAgentReqBody,
  IAdminAgentUpdateAgencyUserReqBody,
  IAdminUpsertAgentEmailCredentialReqBody,
  IAdminGetAgentEmailCredentialReqQuery,
} from '../../utils/types/adminAgentTypes/adminAgentAgency.types';
import CustomError from '../../../../utils/lib/customError';
import { IUpdateAgencyPayload } from '../../../../utils/modelTypes/agentModel/agencyModelTypes';
import { v4 as uuidv4 } from 'uuid';
import { ITokenParseAgencyUser } from '../../../public/utils/types/publicCommon.types';
import Lib from '../../../../utils/lib/lib';
import config from '../../../../config/config';
import {
  ADMIN_NOTIFY_EMAIL,
  GENERATE_AUTO_UNIQUE_ID,
  SOURCE_AGENT,
  TYPE_FLIGHT,
  TYPE_HOTEL,
} from '../../../../utils/miscellaneous/constants';
import EmailSendLib from '../../../../utils/lib/emailSendLib';
import { registrationVerificationCompletedTemplate } from '../../../../utils/templates/registrationVerificationCompletedTemplate';
import {
  IInsertAgencyRolePermissionPayload,
  IUpdateAgencyUserPayload,
} from '../../../../utils/modelTypes/agentModel/agencyUserModelTypes';
import { SiteConfigSupportService } from '../../../../utils/supportServices/otherSupportServices/siteConfigSupport.service';

export default class AdminAgentAgencyService extends AbstractServices {
  constructor() {
    super();
  }

  public async getAgency(req: Request) {
    const query = req.query as unknown as IAdminAgentGetAgencyReqQuery;
    const AgencyModel = this.Model.AgencyModel();

    const data = await AgencyModel.getAgencyList(
      { ...query, agency_type: SOURCE_AGENT },
      true
    );

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
      const AgencyUserModel = this.Model.AgencyUserModel(trx);

      const data = await AgencyModel.getSingleAgency({
        id: agency_id,
        type: SOURCE_AGENT,
      });

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const users = await AgencyUserModel.getUserList({ agency_id }, true);

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
        const wPermissions = await AgencyModel.getWhiteLabelPermission({
          agency_id,
        });

        if (wPermissions) {
          whiteLabelPermissions = wPermissions;
        }
      }

      const otherModel = this.Model.OthersModel(trx);
      const email_credential = await otherModel.getEmailCreds(agency_id);

      const payment_gateway_creds = await otherModel.getPaymentGatewayCreds({
        agency_id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          ...data,
          users: users.data,
          total_user: users.total,
          whiteLabelPermissions,
          email_credential: email_credential || null,
          payment_gateway_creds: payment_gateway_creds,
        },
      };
    });
  }

  public async updateAgencyUser(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.params;
      const AgencyUserModel = this.Model.AgencyUserModel(trx);
      const checkUser = await AgencyUserModel.checkUser({
        id: Number(user_id),
        agency_id: Number(agency_id),
      });

      if (!checkUser) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND
        );
      }

      const body = req.body as IAdminAgentUpdateAgencyUserReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      const payload: IUpdateAgencyUserPayload = body;

      if (files.length) {
        payload.photo = files[0].filename;
      }

      if (payload.email) {
        const checkEmail = await AgencyUserModel.checkUser({
          email: body.email,
          agency_id: Number(agency_id),
        });

        if (checkEmail) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: 'Email already exists. Please use another email',
          };
        }
      }

      await AgencyUserModel.updateUser(payload, {
        agency_id: Number(agency_id),
        id: Number(user_id),
      });

      if (checkUser.photo && payload.photo) {
        await this.manageFile.deleteFromCloud([checkUser.photo]);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          photo: payload.photo,
        },
      };
    });
  }

  public async updateAgency(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.params;
      const agency_id = Number(id);
      const AgentModel = this.Model.AgencyModel(trx);
      const SiteConfigModel = this.Model.AgencyB2CConfigModel(trx);
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
      const { white_label_permissions, kam_id, ref_id, email, ...restBody } =
        req.body as IAdminAgentUpdateAgencyReqBody;

      const files = (req.files as Express.Multer.File[]) || [];
      const payload: IUpdateAgencyPayload = { ...restBody };

      if (email) {
        const checkEmail = await AgentModel.checkAgency({
          email,
          agency_type: SOURCE_AGENT,
        });
        if (checkEmail) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: 'Email already exists. Please use another email',
          };
        }

        payload.email = email;
      }

      if (kam_id) {
        const adminModel = this.Model.AdminModel(trx);
        const checkKam = await adminModel.checkUserAdmin({ id: kam_id });
        if (!checkKam) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'Invalid KAM ID',
          };
        } else {
          payload.kam_id = kam_id;
        }
      }

      if (ref_id) {
        const adminModel = this.Model.AdminModel(trx);
        const checkKam = await adminModel.checkUserAdmin({ id: ref_id });
        if (!checkKam) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'Invalid Ref ID',
          };
        } else {
          payload.ref_id = ref_id;
        }
      }

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

      if (restBody.white_label) {
        const checkPermission = await AgentModel.getWhiteLabelPermission({
          agency_id,
        });

        const checkConfig = await SiteConfigModel.getSiteConfig({ agency_id });
        if (!checkConfig) {
          const siteService = new SiteConfigSupportService(trx);

          await siteService.insertSiteConfigData({
            agency_id: agency_id,
            address: checkAgency.address,
            email: checkAgency.email,
            phone: checkAgency.phone,
            site_name: checkAgency.agency_name,
            logo: checkAgency.agency_logo,
          });
        }

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
        const checkPermission = await AgentModel.getWhiteLabelPermission({
          agency_id,
        });

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
        details: `Agency Updated - ${checkAgency.agency_name}(${checkAgency.agent_no})`,
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
      const MarkupSetModel = this.Model.DynamicFareSetModel(trx);
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
        if (!body.hotel_markup_set || !body.flight_markup_set || !body.kam_id) {
          return {
            success: false,
            code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
            message:
              'Flight, hotel markup sets and kam_id are required for activation.',
          };
        }

        const checkFlightMarkupSet = await MarkupSetModel.checkDynamicFareSet({
          id: body.flight_markup_set,
          status: true,
          type: TYPE_FLIGHT,
        });

        if (!checkFlightMarkupSet) {
          return {
            success: false,
            code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
            message: 'Invalid flight markup set.',
          };
        }

        const checkHotelMarkupSet =
          await MarkupSetModel.getSingleDynamicFareSet({
            id: body.hotel_markup_set,
            status: true,
            type: TYPE_HOTEL,
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
        payload.kam_id = body.kam_id;
        payload.book_permission = body.book_permission;
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
        agency_type,
        ref_agent_id,
        agency_logo,
        address,
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
        agency_type,
        ref_agent_id,
        address,
        agency_logo,
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
      const { white_label_permissions, user_name, ref_id, ...rest } = body;

      const agencyModel = this.Model.AgencyModel(trx);
      const agencyUserModel = this.Model.AgencyUserModel(trx);
      const adminModel = this.Model.AdminModel(trx);

      const checkSubAgentName = await agencyModel.checkAgency({
        name: body.agency_name,
        agency_type: SOURCE_AGENT,
      });

      if (checkSubAgentName) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message:
            'Duplicate agency name! Agency already exists with this name',
        };
      }

      const checkAgentUser = await agencyUserModel.checkUser({
        email: body.email,
        agency_type: SOURCE_AGENT,
      });

      if (checkAgentUser) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'Email already exists. Please use another email',
        };
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

      const agent_no = await Lib.generateNo({
        trx,
        type: GENERATE_AUTO_UNIQUE_ID.agent,
      });

      const checkKam = await adminModel.checkUserAdmin({ id: body.kam_id });

      if (!checkKam) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Invalid KAM ID',
        };
      }

      if (ref_id) {
        const checkRef = await adminModel.checkUserAdmin({ id: ref_id });

        if (!checkRef) {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: 'Invalid Ref id',
          };
        }
      }

      const newAgency = await agencyModel.createAgency({
        status: 'Active',
        agent_no: agent_no,
        agency_logo,
        civil_aviation,
        trade_license,
        national_id,
        created_by: user_id,
        ...rest,
        agency_type: SOURCE_AGENT,
        ref_id,
      });

      const newRole = await agencyUserModel.createRole({
        agency_id: newAgency[0].id,
        name: 'Super Admin',
        is_main_role: true,
      });

      const rolePermissionsPayload: IInsertAgencyRolePermissionPayload[] = [];

      const permissions = await agencyUserModel.getAllPermissions();

      permissions.forEach((permission) => {
        rolePermissionsPayload.push({
          role_id: newRole[0].id,
          permission_id: permission.id,
          agency_id: newAgency[0].id,
          delete: true,
          write: true,
          read: true,
          update: true,
        });
      });

      await agencyUserModel.insertRolePermission(rolePermissionsPayload);

      let username = Lib.generateUsername(body.user_name);

      let suffix = 1;

      while (await agencyUserModel.checkUser({ username })) {
        username = `${username}${suffix}`;
        suffix += 1;
      }

      const password = Lib.generateRandomPassword(12);
      const hashed_password = await Lib.hashValue(password);

      const newUser = await agencyUserModel.createUser({
        agency_id: newAgency[0].id,
        email: body.email,
        hashed_password,
        is_main_user: true,
        name: body.user_name,
        phone_number: body.phone,
        role_id: newRole[0].id,
        username,
      });

      if (body.white_label && white_label_permissions) {
        const uuid = uuidv4();
        await agencyModel.createWhiteLabelPermission({
          agency_id: newAgency[0].id,
          ...white_label_permissions,
          token: uuid,
        });

        const siteService = new SiteConfigSupportService(trx);

        await siteService.insertSiteConfigData({
          agency_id: newAgency[0].id,
          address: body.address,
          email: body.email,
          phone: body.phone,
          site_name: body.agency_name,
          logo: agency_logo,
        });

        if (white_label_permissions.flight || white_label_permissions.hotel) {
          await agencyModel.createAgentB2CMarkup({
            agency_id: newAgency[0].id,
            flight_markup: 200,
            flight_markup_mode: 'INCREASE',
            flight_markup_type: 'FLAT',
            hotel_markup: 200,
            hotel_markup_mode: 'INCREASE',
            hotel_markup_type: 'FLAT',
          });
        }
      }

      await EmailSendLib.sendEmail({
        email: `${body.email}, ${ADMIN_NOTIFY_EMAIL}`,
        emailSub: `Booking Expert Agency Credentials`,
        emailBody: registrationVerificationCompletedTemplate(body.agency_name, {
          email: body.email,
          password: password,
        }),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Agent has been created',
        data: {
          agency_id: newAgency[0].id,
          user_id: newUser[0].id,
          agency_logo,
          civil_aviation,
          trade_license,
          national_id,
        },
      };
    });
  }

  public async upsertAgencyEmailCredential(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id } = req.admin;
      const { agency_id } = req.params;
      const body = req.body as IAdminUpsertAgentEmailCredentialReqBody;
      const model = this.Model.OthersModel(trx);
      const AgentModel = this.Model.AgencyModel(trx);
      const checkAgency = await AgentModel.checkAgency({
        agency_id: Number(agency_id),
      });

      if (!checkAgency) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND
        );
      }
      const check_duplicate = await model.getEmailCreds(Number(agency_id));

      //update
      if (check_duplicate) {
        await model.updateEmailCreds(body, Number(agency_id));
        await this.insertAdminAudit(trx, {
          created_by: user_id,
          details: `Email credentials has been updated for agency - ${checkAgency.agency_name}(${checkAgency.agent_no})`,
          type: 'UPDATE',
          payload: body,
        });
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: 'Email credentials has been updated',
        };
      } else {
        //create
        await model.insertEmailCreds({ ...body, agency_id: Number(agency_id) });
        await this.insertAdminAudit(trx, {
          created_by: user_id,
          details: `Email credentials has been created for agency - ${checkAgency.agency_name}(${checkAgency.agent_no})`,
          type: 'CREATE',
          payload: body,
        });
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Email credentials has been added',
      };
    });
  }

  public async upsertAgencyPaymentGatewayCredential(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { user_id } = req.admin;
      const { agency_id } = req.params;
      const body = req.body as IAdminGetAgentEmailCredentialReqQuery;

      const agencyModel = this.Model.AgencyModel(trx);
      const othersModel = this.Model.OthersModel(trx);
      const checkAgency = await agencyModel.checkAgency({
        agency_id: Number(agency_id),
      });
      if (!checkAgency) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND
        );
      }

      await Promise.all(
        body.cred.map(async (item) => {
          const check_duplicate = await othersModel.getPaymentGatewayCreds({
            agency_id: Number(agency_id),
            gateway_name: body.gateway_name,
            key: item.key,
          });

          console.log(check_duplicate);

          if (check_duplicate.length) {
            await othersModel.updatePaymentGatewayCreds(
              { value: item.value },
              check_duplicate[0].id
            );
          } else {
            await othersModel.insertPaymentGatewayCreds({
              agency_id: Number(agency_id),
              gateway_name: body.gateway_name,
              ...item,
            });
          }
        })
      );

      await this.insertAdminAudit(trx, {
        created_by: user_id,
        details: `Payment gateway credentials has been updated for agency - ${checkAgency.agency_name}(${checkAgency.agent_no})`,
        type: 'UPDATE',
        payload: body,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Payment gateway credentials has been updated',
      };
    });
  }
}
