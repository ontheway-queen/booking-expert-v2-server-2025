import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import {
  IAgentCreateSubAgentReqBody,
  IAgentGetSubAgencyReqQuery,
  IAgentSubAgencyUsersQueryFilter,
  IAgentUpdateSubAgencyPayload,
} from '../utils/types/agentSubAgent.types';
import CustomError from '../../../utils/lib/customError';
import Lib from '../../../utils/lib/lib';
import {
  GENERATE_AUTO_UNIQUE_ID,
  SOURCE_SUB_AGENT,
} from '../../../utils/miscellaneous/constants';
import EmailSendLib from '../../../utils/lib/emailSendLib';
import { registrationVerificationCompletedTemplate } from '../../../utils/templates/registrationVerificationCompletedTemplate';

export default class AgentSubAgentService extends AbstractServices {
  constructor() {
    super();
  }

  public async createSubAgency(req: Request) {
    return this.db.transaction(async (trx) => {
      const { user_id, agency_id, agency_type } = req.agencyUser;
      if (agency_type === 'SUB AGENT') {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: 'No authority has been found to create a SUB AGENT',
        };
      }

      const body = req.body as IAgentCreateSubAgentReqBody;
      const {
        email,
        agency_name,
        user_name,
        address,
        phone,
        flight_markup_type,
        hotel_markup_type,
        flight_markup_mode,
        hotel_markup_mode,
        flight_markup,
        hotel_markup,
      } = body;

      const agencyModel = this.Model.AgencyModel(trx);
      const agencyUserModel = this.Model.AgencyUserModel(trx);
      const subAgentMarkupModel = this.Model.SubAgentMarkupModel(trx);

      const checkSubAgentName = await agencyModel.checkAgency({
        name: agency_name,
        agency_type: SOURCE_SUB_AGENT,
        ref_agent_id: agency_id,
      });

      if (checkSubAgentName) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message:
            'Duplicate agency name! Agency already exists with this name.',
        };
      }

      const checkAgentUser = await agencyUserModel.checkUser({
        email,
        agency_type: SOURCE_SUB_AGENT,
        ref_agent_id: agency_id,
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

      const sub_agent_no = await Lib.generateNo({
        trx,
        type: GENERATE_AUTO_UNIQUE_ID.sub_agent,
      });

      const newSubAgency = await agencyModel.createAgency({
        address,
        status: 'Active',
        agent_no: sub_agent_no,
        agency_name,
        email,
        phone,
        agency_logo,
        civil_aviation,
        trade_license,
        national_id,
        ref_agent_id: agency_id,
        created_by: user_id,
        agency_type: SOURCE_SUB_AGENT,
      });

      const newRole = await agencyUserModel.createRole({
        agency_id: newSubAgency[0].id,
        name: 'Super Admin',
        is_main_role: true,
      });

      let username = Lib.generateUsername(user_name);

      let suffix = 1;

      while (await agencyUserModel.checkUser({ username })) {
        username = `${username}${suffix}`;
        suffix += 1;
      }

      const password = Lib.generateRandomPassword(8);
      const hashed_password = await Lib.hashValue(password);

      const newUser = await agencyUserModel.createUser({
        agency_id: newSubAgency[0].id,
        email,
        hashed_password,
        is_main_user: true,
        name: user_name,
        phone_number: phone,
        role_id: newRole[0].id,
        username,
      });

      await subAgentMarkupModel.createSubAgentMarkup({
        agency_id: newSubAgency[0].id,
        flight_markup_mode,
        hotel_markup_mode,
        flight_markup_type,
        hotel_markup_type,
        flight_markup,
        hotel_markup,
      });

      await EmailSendLib.sendEmailAgent(trx, agency_id, {
        email,
        emailSub: `Booking Expert Agency Credentials`,
        emailBody: registrationVerificationCompletedTemplate(agency_name, {
          email: email,
          password: password,
        }),
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'SUB AGENT has been created',
        data: {
          agency_id: newSubAgency[0].id,
          user_id: newUser[0].id,
          agency_logo,
          civil_aviation,
          trade_license,
          national_id,
        },
      };
    });
  }

  public async getAllSubAgency(req: Request) {
    const { agency_id } = req.agencyUser;
    const query = req.query as unknown as IAgentGetSubAgencyReqQuery;
    const AgencyModel = this.Model.AgencyModel();

    const data = await AgencyModel.getAgencyList(
      { ...query, ref_agent_id: agency_id, agency_type: SOURCE_SUB_AGENT },
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

  public async getSingleSubAgency(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const { id } = req.params;
      const AgencyModel = this.Model.AgencyModel(trx);
      const subAgentMarkupModel = this.Model.SubAgentMarkupModel(trx);

      const data = await AgencyModel.getSingleAgency({
        id: Number(id),
        type: SOURCE_SUB_AGENT,
        ref_agent_id: agency_id,
      });

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const markup_data = await subAgentMarkupModel.getSubAgentMarkup(
        Number(id)
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          ...data,
          markup_data,
        },
      };
    });
  }

  public async updateAgency(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const { id } = req.params;
      const AgentModel = this.Model.AgencyModel(trx);
      const agencyUserModel = this.Model.AgencyUserModel(trx);
      const checkAgency = await AgentModel.checkAgency({
        agency_id: Number(id),
        ref_agent_id: agency_id,
        agency_type: SOURCE_SUB_AGENT,
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

      const {
        flight_markup_type,
        hotel_markup_type,
        flight_markup_mode,
        hotel_markup_mode,
        flight_markup,
        hotel_markup,
        ...rest
      } = req.body as IAgentUpdateSubAgencyPayload;

      const files = (req.files as Express.Multer.File[]) || [];

      const payload = rest;

      if (payload.agency_name) {
        const checkSubAgentName = await AgentModel.checkAgency({
          name: payload.agency_name,
        });
        if (checkSubAgentName) {
          throw new CustomError(
            'Duplicate agency name! Agency already exists with this name',
            this.StatusCode.HTTP_CONFLICT
          );
        }
      }

      if (payload.email) {
        const checkAgentUser = await agencyUserModel.checkUser({
          email: payload.email,
        });

        if (checkAgentUser) {
          throw new CustomError(
            'Email already exists. Please use another email',
            this.StatusCode.HTTP_CONFLICT
          );
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
        await AgentModel.updateAgency(payload, Number(id));
      }

      if (deleteFiles.length) {
        await this.manageFile.deleteFromCloud(deleteFiles);
      }

      if (
        flight_markup ||
        hotel_markup ||
        flight_markup_mode ||
        hotel_markup_mode ||
        flight_markup_type ||
        hotel_markup_type
      ) {
        const subAgentMarkupModel = this.Model.SubAgentMarkupModel(trx);
        await subAgentMarkupModel.updateSubAgentMarkup(
          {
            flight_markup_mode,
            hotel_markup_mode,
            flight_markup_type,
            hotel_markup_type,
            flight_markup,
            hotel_markup,
          },
          Number(id)
        );
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async getAllUsersOfAgency(req: Request) {
    const { id } = req.params;
    const agencyUserModel = this.Model.AgencyUserModel();
    const query = req.query as unknown as IAgentSubAgencyUsersQueryFilter;
    const users = await agencyUserModel.getUserList(
      { ...query, agency_id: Number(id) },
      true
    );
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: users.data,
      total: users.total,
    };
  }
}
