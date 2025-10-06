import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import Lib from '../../../utils/lib/lib';
import {
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
  SOURCE_B2C,
} from '../../../utils/miscellaneous/constants';
import { IAgentB2CVisaApplicationPayload } from '../utils/types/agentB2CVisa.types';

export class AgentB2CVisaService extends AbstractServices {
  //get all visa type
  public async getAllVisaType(req: Request) {
    const { agency_id } = req.agencyB2CWhiteLabel;
    const visaModel = this.Model.VisaModel();

    const visaTypeList = await visaModel.getAgentB2CVisaTypeList({
      source_id: agency_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: visaTypeList,
    };
  }

  //get all visa created country
  public async getAllVisaCreatedCountry(req: Request) {
    const { agency_id } = req.agencyB2CWhiteLabel;
    const visaModel = this.Model.VisaModel();

    console.log('agency_id', agency_id);

    const countryList = await visaModel.getAllVisaCreatedCountry({
      is_deleted: false,
      source_id: agency_id,
      source_type: SOURCE_AGENT,
      status: true,
      visa_for: SOURCE_B2C,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: countryList,
    };
  }

  //Get all visa list
  public async getAllVisaList(req: Request) {
    const { country_id, visa_type_id } = req.query;
    const { agency_id } = req.agencyB2CWhiteLabel;
    const visaModel = this.Model.VisaModel();

    const visaList = await visaModel.getAgentB2CVisaList({
      country_id: Number(country_id),
      visa_type_id: Number(visa_type_id),
      is_deleted: false,
      source_id: agency_id,
      status: true,
      visa_for: 'B2C',
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: visaList,
    };
  }

  //get single visa
  public async getSingleVisa(req: Request) {
    const { slug } = req.params;
    const { agency_id } = req.agencyB2CWhiteLabel;

    const visaModel = this.Model.VisaModel();

    const singleVisa = await visaModel.getAgentB2CSingleVisa({
      slug: slug,
      is_deleted: false,
      source_id: agency_id,
      status: true,
    });

    if (!singleVisa) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: singleVisa,
    };
  }

  //create visa application
  public async createVisaApplication(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyB2CWhiteLabel;
      const { user_id, name } = req.agencyB2CUser;
      const { id } = req.params;
      console.log(req.body);
      const {
        from_date,
        to_date,
        contact_email,
        contact_number,
        whatsapp_number,
        nationality,
        residence,
        passengers,
      } = req.body as IAgentB2CVisaApplicationPayload;
      const files = (req.files as Express.Multer.File[]) || [];

      const visaModel = this.Model.VisaModel(trx);
      const visaApplicationModel = this.Model.VisaApplicationModel(trx);

      const singleVisa = await visaModel.getSingleVisa({
        is_deleted: false,
        source_id: agency_id,
        source_type: SOURCE_AGENT,
        id: Number(id),
        status: true,
      });

      if (!singleVisa) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const application_ref = await Lib.generateNo({ trx, type: 'Agent_Visa' });

      const total_fee =
        Number(singleVisa.visa_fee) + Number(singleVisa.processing_fee);
      const payable = Number(total_fee * passengers?.length);

      const applicationPayload = {
        user_id,
        payable,
        from_date,
        to_date,
        contact_email,
        contact_number,
        whatsapp_number,
        nationality,
        residence,
        application_ref,
        traveler: passengers?.length,
        visa_id: singleVisa.id,
        source_id: agency_id,
        source_type: SOURCE_AGENT_B2C,
        visa_fee: singleVisa.visa_fee,
        processing_fee: singleVisa.processing_fee,
        application_date: new Date(),
      };

      const application = await visaApplicationModel.createVisaApplication(
        applicationPayload
      );

      const applicationTravelerPayload = passengers?.map((passenger) => {
        let required_fields: { [key: string]: string } = {};
        for (let file of files) {
          if (Number(file.fieldname.split('-')[1]) === Number(passenger.key)) {
            required_fields[file.fieldname.split('-')[0]] = file.filename;
          }
        }

        return {
          application_id: application[0].id,
          title: passenger.title,
          type: passenger.type,
          first_name: passenger.first_name,
          last_name: passenger.last_name,
          date_of_birth: passenger.date_of_birth,
          passport_number: passenger.passport_number,
          passport_expiry_date: passenger.passport_expiry_date,
          passport_type: passenger.passport_type,
          city: passenger.city,
          country_id: passenger.country_id,
          address: passenger.address,
          required_fields: required_fields,
        };
      });

      await visaApplicationModel.createVisaApplicationTraveler(
        applicationTravelerPayload
      );

      await visaApplicationModel.createVisaApplicationTracking({
        application_id: application[0].id,
        details: `${name} has applied for the visa`,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: {
          id: application[0].id,
        },
      };
    });
  }

  //get visa application list
  public async getVisaApplicationList(req: Request) {
    const { user_id } = req.agencyB2CUser;
    const { agency_id } = req.agencyB2CWhiteLabel;
    const query = req.query as unknown as {
      limit: number;
      skip: number;
      filter: string;
      from_date: Date;
      to_date: Date;
      status: string;
    };

    const visaApplicationModel = this.Model.VisaApplicationModel();

    const { data, total } =
      await visaApplicationModel.getAgentB2CVisaApplicationList({
        user_id,
        source_id: agency_id,
        source_type: SOURCE_AGENT_B2C,
        limit: query.limit,
        skip: query.skip,
        filter: query.filter,
        from_date: query.from_date,
        to_date: query.to_date,
        status: query.status,
      });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  //get single visa
  public async getSingleVisaApplication(req: Request) {
    const { id } = req.params;
    const { user_id } = req.agencyB2CUser;
    const { agency_id } = req.agencyB2CWhiteLabel;
    const visaApplicationModel = this.Model.VisaApplicationModel();

    const application_data =
      await visaApplicationModel.getAgentB2CSingleVisaApplication({
        user_id,
        source_id: agency_id,
        source_type: SOURCE_AGENT_B2C,
        id: Number(id),
      });

    if (!application_data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const applicationTraveler =
      await visaApplicationModel.getAgentB2CSingleVisaApplicationTraveler({
        application_id: application_data.id,
      });

    const trackings = await visaApplicationModel.getVisaApplicationTrackingList(
      {
        application_id: application_data.id,
      }
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...application_data,
        travelers: applicationTraveler,
        trackings,
      },
    };
  }
}
