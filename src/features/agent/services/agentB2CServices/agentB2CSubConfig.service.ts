import AbstractServices from '../../../../abstract/abstract.service';
import { Request } from 'express';
import {
  ICreateBankAccountReqBody,
  ICreateHeroBGContentReqBody,
  ICreateHotDealsReqBody,
  ICreatePopularDestinationReqBody,
  ICreatePopularPlaceReqBody,
  IUpdateBankAccountReqBody,
  IUpdateHeroBGContentReqBody,
  IUpdateHotDealsReqBody,
  IUpdatePopularDestinationReqBody,
  IUpdatePopularPlaceReqBody,
} from '../../utils/types/agentB2CSubTypes/agentB2CSubConfig.types';
import {
  IUpdateAgencyB2CHeroBgContentPayload,
  IUpdateAgencyB2CHotDealsPayload,
  IUpdateAgencyB2CPopularDestinationPayload,
  IUpdateAgencyB2CPopularPlace,
} from '../../../../utils/modelTypes/agencyB2CModelTypes/agencyB2CConfigModel.types';
import { SOURCE_AGENT } from '../../../../utils/miscellaneous/constants';
import {
  heroBG,
  popularDestination,
  popularPlaces,
} from '../../../../utils/miscellaneous/siteConfig/pagesContent';

export class AgentB2CSubConfigService extends AbstractServices {
  public async getB2CMarkup(req: Request) {
    const { agency_id } = req.agencyUser;
    const model = this.Model.AgencyModel();
    const data = await model.getAgentB2CMarkup(agency_id);
    if (!data) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'No markup has been set for B2C',
        data: {},
      };
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async upsertB2CMarkup(req: Request) {
    const { agency_id, user_id } = req.agencyUser;
    const model = this.Model.AgencyModel();
    const data = await model.getAgentB2CMarkup(agency_id);
    if (data) {
      await model.updateAgentB2CMarkup(req.body, agency_id);
    } else {
      await model.createAgentB2CMarkup({ agency_id, ...req.body });
    }

    await this.insertAgentAudit(undefined, {
      agency_id,
      created_by: user_id,
      details: 'Updated/Inserted B2C markup.',
      payload: JSON.stringify(req.body),
      type: 'UPDATE',
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Markup has been updated for B2C',
    };
  }

  public async getAccounts(req: Request) {
    const { agency_id } = req.agencyUser;

    const { limit, skip } = req.query as { limit?: string; skip?: string };

    const configModel = this.Model.OthersModel();
    const { data, total } = await configModel.getAccount(
      {
        source_type: SOURCE_AGENT,
        source_id: agency_id,
        limit,
        skip,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  public async updateAccounts(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;

      const configModel = this.Model.OthersModel(trx);
      const { id } = req.params;
      const account_id = Number(id);

      const account = await configModel.checkAccount({
        source_type: 'AGENT',
        source_id: agency_id,
        id: account_id,
      });
      const payload = req.body as IUpdateBankAccountReqBody;

      if (!account || !Object.keys(payload).length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await configModel.updateAccount(
        { id: account_id, source_type: 'AGENT', source_id: agency_id },
        payload
      );

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: 'Updated Account data.',
        payload: JSON.stringify(payload),
        type: 'UPDATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async createAccounts(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;

      const OtersModel = this.Model.OthersModel(trx);
      const CommonModel = this.Model.CommonModel(trx);

      const body = req.body as ICreateBankAccountReqBody;
      console.log({ body });
      const checkBank = await CommonModel.getBanks({
        id: body.bank_id,
        status: true,
      });

      if (!checkBank.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Bank not found.',
        };
      }

      const account = await OtersModel.createAccount({
        ...body,
        source_type: 'AGENT',
        source_id: agency_id,
      });

      await this.insertAgentAudit(undefined, {
        agency_id,
        created_by: user_id,
        details: 'New Account created.',
        payload: JSON.stringify({ ...body, bank: checkBank[0].name }),
        type: 'CREATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: {
          id: account[0].id,
        },
      };
    });
  }

  public async deleteAccounts(req: Request) {
    const { agency_id, user_id } = req.agencyUser;

    const OthersModel = this.Model.OthersModel();

    const { id } = req.params;
    const account_id = Number(id);

    const account = await OthersModel.checkAccount({
      source_type: 'AGENT',
      source_id: agency_id,
      id: account_id,
    });

    if (!account) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    await OthersModel.deleteAccount({
      id: account_id,
      source_type: 'AGENT',
      source_id: agency_id,
    });

    await this.insertAgentAudit(undefined, {
      agency_id,
      created_by: user_id,
      details: `Account ${account.account_name}(${account.bank_name})[${account.account_number}] is deleted.`,
      type: 'DELETE',
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  public async getHeroBGContent(req: Request) {
    const configModel = this.Model.AgencyB2CConfigModel();
    const { agency_id } = req.agencyUser;
    const { limit, skip } = req.query as { limit?: string; skip?: string };

    const { data, total } = await configModel.getHeroBGContent(
      {
        agency_id,
        limit,
        skip,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  public async createHeroBGContent(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const { agency_id, user_id } = req.agencyUser;

      const body = req.body as ICreateHeroBGContentReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      if (!files.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Content is required',
        };
      }

      const lastOrderNumber = await configModel.getHeroBGContentLastNo({
        agency_id,
      });

      const heroBG = await configModel.insertHeroBGContent({
        agency_id,
        ...body,
        content: files[0].filename,
        order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1,
      });

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `New bg content(${body.type}) created for ${
          body.tab || 'all tab'
        }(${files[0].filename}).`,
        payload: JSON.stringify({
          ...body,
          content: files[0].filename,
          order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1,
        }),
        type: 'CREATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          content: files[0].filename,
          id: heroBG[0].id,
        },
      };
    });
  }

  public async updateHeroBGContent(req: Request) {
    return this.db.transaction(async (trx) => {
      const body = req.body as IUpdateHeroBGContentReqBody;
      const { agency_id, user_id } = req.agencyUser;
      const configModel = this.Model.AgencyB2CConfigModel(trx);

      const id = Number(req.params.id);

      const check = await configModel.checkHeroBGContent({ agency_id, id });

      if (!check.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const payload: IUpdateAgencyB2CHeroBgContentPayload = body;

      if (files.length) {
        payload.content = files[0].filename;
      }

      if (!Object.keys(payload).length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }

      await configModel.updateHeroBGContent(payload, { agency_id, id });

      if (payload.content && check[0].content) {
        const heroContent = heroBG(agency_id);

        const found = heroContent.find(
          (item) => item.content === check[0].content
        );

        if (!found) {
          await this.manageFile.deleteFromCloud([check[0].content]);
        }
      }

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `BG content(${id}) is updated.`,
        payload: JSON.stringify(payload),
        type: 'CREATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { content: payload.content },
      };
    });
  }

  public async deleteHeroBGContent(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;
      const configModel = this.Model.AgencyB2CConfigModel(trx);

      const id = Number(req.params.id);

      const check = await configModel.checkHeroBGContent({ agency_id, id });

      if (!check.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await configModel.deleteHeroBGContent({ agency_id, id });

      if (check[0].content) {
        const heroContent = heroBG(agency_id);

        const found = heroContent.find(
          (item) => item.content === check[0].content
        );

        if (!found) {
          await this.manageFile.deleteFromCloud([check[0].content]);
        }
      }

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Deleted BG content(${id}).`,
        type: 'DELETE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async getPopularDestination(req: Request) {
    const configModel = this.Model.AgencyB2CConfigModel();
    const { agency_id } = req.agencyUser;
    const { limit, skip } = req.query as { limit?: string; skip?: string };

    const { data, total } = await configModel.getPopularDestination(
      {
        agency_id,
        limit,
        skip,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  public async createPopularDestination(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const CommonModel = this.Model.CommonModel(trx);
      const { agency_id, user_id } = req.agencyUser;

      const body = req.body as ICreatePopularDestinationReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      if (!files.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Thumbnail is required',
        };
      }

      const checkFromAirport = await CommonModel.getAirport({
        id: body.from_airport,
      });

      if (!checkFromAirport.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'From Airport not found.',
        };
      }
      const toAirport = await CommonModel.getAirport({
        id: body.to_airport,
      });

      if (!toAirport.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'To Airport not found.',
        };
      }

      const lastOrderNumber = await configModel.getPopularDestinationLastNo({
        agency_id,
      });

      await configModel.insertPopularDestination({
        agency_id,
        ...body,
        thumbnail: files[0].filename,
        order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1,
      });

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `New popular destination is created.`,
        payload: JSON.stringify({
          ...body,
          thumbnail: files[0].filename,
          order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1,
        }),
        type: 'CREATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { thumbnail: files[0].filename },
      };
    });
  }

  public async updatePopularDestination(req: Request) {
    return this.db.transaction(async (trx) => {
      const body = req.body as IUpdatePopularDestinationReqBody;
      const { agency_id, user_id } = req.agencyUser;
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const CommonModel = this.Model.CommonModel(trx);

      const id = Number(req.params.id);

      const check = await configModel.checkPopularDestination({
        agency_id,
        id,
      });

      if (!check) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (body.from_airport) {
        const checkFromAirport = await CommonModel.getAirport({
          id: body.from_airport,
        });

        if (!checkFromAirport.data.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'From Airport not found.',
          };
        }
      }

      if (body.to_airport) {
        const toAirport = await CommonModel.getAirport({
          id: body.to_airport,
        });

        if (!toAirport.data.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'To Airport not found.',
          };
        }
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const payload: IUpdateAgencyB2CPopularDestinationPayload = body;

      if (files.length) {
        payload.thumbnail = files[0].filename;
      }

      if (!Object.keys(payload).length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }

      await configModel.updatePopularDestination(payload, { agency_id, id });

      if (payload.thumbnail && check.thumbnail) {
        const heroContent = popularDestination(agency_id);

        const found = heroContent.find(
          (item) => item.thumbnail === check.thumbnail
        );

        if (!found) {
          await this.manageFile.deleteFromCloud([check.thumbnail]);
        }
      }
      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Popular destination(${id}) is updated.`,
        payload: JSON.stringify(payload),
        type: 'UPDATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { content: payload.thumbnail },
      };
    });
  }

  public async deletePopularDestination(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;
      const configModel = this.Model.AgencyB2CConfigModel(trx);

      const id = Number(req.params.id);

      const check = await configModel.checkPopularDestination({
        agency_id,
        id,
      });

      if (!check) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await configModel.deletePopularDestination({ agency_id, id });

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Deleted Popular destination(${id}).`,
        type: 'DELETE',
      });

      if (check.thumbnail) {
        const heroContent = popularDestination(agency_id);

        const found = heroContent.find(
          (item) => item.thumbnail === check.thumbnail
        );

        if (!found) {
          await this.manageFile.deleteFromCloud([check.thumbnail]);
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async getPopularPlace(req: Request) {
    const configModel = this.Model.AgencyB2CConfigModel();
    const { agency_id } = req.agencyUser;
    const { limit, skip } = req.query as { limit?: string; skip?: string };

    const { data, total } = await configModel.getPopularPlaces(
      {
        agency_id,
        limit,
        skip,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  public async createPopularPlace(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const CommonModel = this.Model.CommonModel(trx);
      const { agency_id, user_id } = req.agencyUser;

      const body = req.body as ICreatePopularPlaceReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      if (!files.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Thumbnail is required',
        };
      }

      const checkCountry = await CommonModel.getCountry({
        id: body.country_id,
      });

      if (!checkCountry.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: 'Country not found.',
        };
      }

      const lastOrderNumber = await configModel.getPopularPlaceLastNo({
        agency_id,
      });

      await configModel.insertPopularPlaces({
        agency_id,
        ...body,
        thumbnail: files[0].filename,
        order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1,
      });

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `New popular place is created.`,
        payload: JSON.stringify({
          ...body,
          thumbnail: files[0].filename,
          order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1,
        }),
        type: 'CREATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { thumbnail: files[0].filename },
      };
    });
  }

  public async updatePopularPlace(req: Request) {
    return this.db.transaction(async (trx) => {
      const body = req.body as IUpdatePopularPlaceReqBody;
      const { agency_id, user_id } = req.agencyUser;
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const CommonModel = this.Model.CommonModel(trx);

      const id = Number(req.params.id);

      const check = await configModel.checkPopularPlace({
        agency_id,
        id,
      });

      if (!check) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (body.country_id) {
        const checkCountry = await CommonModel.getCountry({
          id: body.country_id,
        });

        if (!checkCountry.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'Country not found.',
          };
        }
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const payload: IUpdateAgencyB2CPopularPlace = body;

      if (files.length) {
        payload.thumbnail = files[0].filename;
      }

      if (!Object.keys(payload).length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }

      await configModel.updatePopularPlace(payload, { agency_id, id });

      if (payload.thumbnail && check.thumbnail) {
        const heroContent = popularPlaces(agency_id);

        const found = heroContent.find(
          (item) => item.thumbnail === check.thumbnail
        );

        if (!found) {
          await this.manageFile.deleteFromCloud([check.thumbnail]);
        }
      }

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Popular place(${id}) is updated.`,
        payload: JSON.stringify(payload),
        type: 'UPDATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { content: payload.thumbnail },
      };
    });
  }

  public async deletePopularPlace(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;
      const configModel = this.Model.AgencyB2CConfigModel(trx);

      const id = Number(req.params.id);

      const check = await configModel.checkPopularPlace({
        agency_id,
        id,
      });

      if (!check) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await configModel.deletePopularPlace({ agency_id, id });

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Deleted Popular place(${id}).`,
        type: 'DELETE',
      });

      if (check.thumbnail) {
        const heroContent = popularPlaces(agency_id);

        const found = heroContent.find(
          (item) => item.thumbnail === check.thumbnail
        );

        if (!found) {
          await this.manageFile.deleteFromCloud([check.thumbnail]);
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async getHotDeals(req: Request) {
    const configModel = this.Model.AgencyB2CConfigModel();
    const { agency_id } = req.agencyUser;
    const { limit, skip } = req.query as { limit?: string; skip?: string };

    const { data, total } = await configModel.getHotDeals(
      {
        agency_id,
        limit,
        skip,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  public async createHotDeals(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const { agency_id, user_id } = req.agencyUser;

      const body = req.body as ICreateHotDealsReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      if (!files.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Thumbnail is required',
        };
      }

      const lastOrderNumber = await configModel.getHotDealsLastNo({
        agency_id,
      });

      await configModel.insertHotDeals({
        agency_id,
        ...body,
        thumbnail: files[0].filename,
        order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1,
      });

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `New Hot deals is created.`,
        payload: JSON.stringify({
          ...body,
          thumbnail: files[0].filename,
          order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1,
        }),
        type: 'CREATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { thumbnail: files[0].filename },
      };
    });
  }

  public async updateHotDeals(req: Request) {
    return this.db.transaction(async (trx) => {
      const body = req.body as IUpdateHotDealsReqBody;
      const { agency_id, user_id } = req.agencyUser;
      const configModel = this.Model.AgencyB2CConfigModel(trx);

      const id = Number(req.params.id);

      const check = await configModel.checkHotDeals({
        agency_id,
        id,
      });

      if (!check) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const payload: IUpdateAgencyB2CHotDealsPayload = body;

      if (files.length) {
        payload.thumbnail = files[0].filename;
      }

      if (!Object.keys(payload).length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }

      await configModel.updateHotDeals(payload, { agency_id, id });

      if (payload.thumbnail && check.thumbnail) {
        await this.manageFile.deleteFromCloud([check.thumbnail]);
      }

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Hot deals(${id}) is updated.`,
        payload: JSON.stringify(payload),
        type: 'UPDATE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: { content: payload.thumbnail },
      };
    });
  }

  public async deleteHotDeals(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyUser;
      const configModel = this.Model.AgencyB2CConfigModel(trx);

      const id = Number(req.params.id);

      const check = await configModel.checkHotDeals({
        agency_id,
        id,
      });

      if (!check) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      await configModel.deleteHotDeals({ agency_id, id });

      if (check.thumbnail) {
        await this.manageFile.deleteFromCloud([check.thumbnail]);
      }

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Deleted Hot deals(${id}).`,
        type: 'DELETE',
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async createVisaType(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const { name } = req.body;

      const configModel = this.Model.AgencyB2CConfigModel(trx);

      const existingVisaType = await configModel.getSingleVisaTypeByName({
        name: name,
        source_id: agency_id,
        source_type: SOURCE_AGENT,
      });

      if (existingVisaType) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: this.ResMsg.HTTP_CONFLICT,
        };
      }

      const payload = {
        name: name,
        source_id: agency_id,
        source_type: SOURCE_AGENT,
      };

      await configModel.createVisaType(payload);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  public async getAllVisaType(req: Request) {
    const { agency_id } = req.agencyUser;

    const configModel = this.Model.AgencyB2CConfigModel();

    const visaTypes = await configModel.getAllVisaType({
      source_id: agency_id,
      source_type: SOURCE_AGENT,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: visaTypes,
    };
  }

  public async deleteVisaType(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const { id } = req.params;

      const configModel = this.Model.AgencyB2CConfigModel(trx);

      const checkVisaType = await configModel.getSingleVisaType({
        id: Number(id),
      });

      if (!checkVisaType) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      // Check if any visa exists with this visa type
      const visaModel = this.Model.VisaModel(trx);
      const checkVisa = await visaModel.checkVisaExistsByVisaType({
        visa_type_id: Number(id),
      });

      if (checkVisa.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message:
            'Cannot delete this visa type as it is associated with existing visas.',
        };
      }

      await configModel.deleteVisaType({
        id: Number(id),
        source_id: agency_id,
        source_type: SOURCE_AGENT,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  public async createVisaMode(req: Request) {
    const { agency_id } = req.agencyUser;
    const { name } = req.body;
    const configModel = this.Model.AgencyB2CConfigModel();

    const existingVisaMode = await configModel.getSingleVisaModeByName({
      name: name,
      source_id: agency_id,
      source_type: SOURCE_AGENT,
    });

    if (existingVisaMode) {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: this.ResMsg.HTTP_CONFLICT,
      };
    }

    const payload = {
      name: name,
      source_id: agency_id,
      source_type: SOURCE_AGENT,
    };

    await configModel.createVisaMode(payload);
    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  public async getAllVisaMode(req: Request) {
    const { agency_id } = req.agencyUser;

    const configModel = this.Model.AgencyB2CConfigModel();

    const visaModes = await configModel.getAllVisaMode({
      source_id: agency_id,
      source_type: SOURCE_AGENT,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: visaModes,
    };
  }

  public async deleteVisaMode(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id } = req.agencyUser;
      const { id } = req.params;

      const configModel = this.Model.AgencyB2CConfigModel(trx);

      const checkVisaMode = await configModel.getSingleVisaMode({
        id: Number(id),
      });

      if (!checkVisaMode) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      // Check if any visa exists with this visa mode
      const visaModel = this.Model.VisaModel(trx);
      const checkVisa = await visaModel.checkVisaExistsByVisaMode({
        visa_mode_id: Number(id),
      });
      if (checkVisa.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message:
            'Cannot delete this visa mode as it is associated with existing visas.',
        };
      }

      await configModel.deleteVisaMode({
        id: Number(id),
        source_id: agency_id,
        source_type: SOURCE_AGENT,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
