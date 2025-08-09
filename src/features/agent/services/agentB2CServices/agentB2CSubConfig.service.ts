import AbstractServices from "../../../../abstract/abstract.service";
import { Request } from "express";
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
} from "../../utils/types/agentB2CSubTypes/agentB2CSubConfig.types";
import {
  IUpdateAgencyB2CHeroBgContentPayload,
  IUpdateAgencyB2CHotDealsPayload,
  IUpdateAgencyB2CPopularDestinationPayload,
  IUpdateAgencyB2CPopularPlace,
} from "../../../../utils/modelTypes/agencyB2CModelTypes/agencyB2CConfigModel.types";

export class AgentB2CSubConfigService extends AbstractServices {
  public async getB2CMarkup(req: Request) {
    const { agency_id } = req.agencyUser;
    const model = this.Model.AgencyModel();
    const data = await model.getAgentB2CMarkup(agency_id);
    if (!data) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "No markup has been set for B2C",
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
      details: "Updated/Inserted B2C markup.",
      payload: JSON.stringify(req.body),
      type: "UPDATE",
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Markup has been updated for B2C",
    };
  }

  public async getAccounts(req: Request) {
    const { agency_id } = req.agencyB2CUser;

    const configModel = this.Model.OthersModel();
    const accounts = await configModel.getAccount({
      source_type: "AGENT",
      source_id: agency_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: accounts,
    };
  }

  public async updateAccounts(req: Request) {
    return this.db.transaction(async (trx) => {
      const { agency_id, user_id } = req.agencyB2CUser;

      const configModel = this.Model.OthersModel(trx);
      const { id } = req.params;
      const account_id = Number(id);

      const account = await configModel.checkAccount({
        source_type: "AGENT",
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
        { id: account_id, source_type: "AGENT", source_id: agency_id },
        payload
      );

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: "Updated Account data.",
        payload: JSON.stringify(payload),
        type: "UPDATE",
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
      const { agency_id, user_id } = req.agencyB2CUser;

      const OtersModel = this.Model.OthersModel(trx);
      const CommonModel = this.Model.CommonModel(trx);

      const body = req.body as ICreateBankAccountReqBody;

      const checkBank = await CommonModel.getBanks({ id: body.bank_id });

      if (!checkBank.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Bank not found.",
        };
      }

      await OtersModel.createAccount(body);

      await this.insertAgentAudit(undefined, {
        agency_id,
        created_by: user_id,
        details: "New Account created.",
        payload: JSON.stringify({ ...body, bank: checkBank[0].name }),
        type: "CREATE",
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  public async deleteAccounts(req: Request) {
    const { agency_id, user_id } = req.agencyB2CUser;

    const OthersModel = this.Model.OthersModel();

    const { id } = req.params;
    const account_id = Number(id);

    const account = await OthersModel.checkAccount({
      source_type: "AGENT",
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
      source_type: "AGENT",
      source_id: agency_id,
    });

    await this.insertAgentAudit(undefined, {
      agency_id,
      created_by: user_id,
      details: `Account ${account.account_name}(${account.bank_name})[${account.account_number}] is deleted.`,
      type: "DELETE",
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  public async getHeroBGContent(req: Request) {
    const configModel = this.Model.AgencyB2CConfigModel();
    const { agency_id } = req.agencyB2CUser;

    const hero_bg_data = await configModel.getHeroBGContent({
      agency_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: hero_bg_data,
    };
  }

  public async createHeroBGContent(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const { agency_id, user_id } = req.agencyB2CUser;

      const body = req.body as ICreateHeroBGContentReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      if (!files.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Content is required",
        };
      }

      const lastOrderNumber = await configModel.getHeroBGContentLastNo({
        agency_id,
      });

      await configModel.insertHeroBGContent({
        agency_id,
        ...body,
        content: files[0].filename,
        order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1,
      });

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `New bg content(${body.type}) created for ${
          body.tab || "all tab"
        }(${files[0].filename}).`,
        payload: JSON.stringify({
          ...body,
          content: files[0].filename,
          order_number: lastOrderNumber ? lastOrderNumber.order_number + 1 : 1,
        }),
        type: "CREATE",
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          content: files[0].filename,
        },
      };
    });
  }

  public async updateHeroBGContent(req: Request) {
    return this.db.transaction(async (trx) => {
      const body = req.body as IUpdateHeroBGContentReqBody;
      const { agency_id, user_id } = req.agencyB2CUser;
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

      await configModel.updateHeroBGContent(payload, { agency_id, id });

      if (payload.content && check[0].content) {
        await this.manageFile.deleteFromCloud([check[0].content]);
      }
      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `BG content(${id}) is updated.`,
        payload: JSON.stringify(payload),
        type: "CREATE",
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
      const { agency_id, user_id } = req.agencyB2CUser;
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
        await this.manageFile.deleteFromCloud([check[0].content]);
      }

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Deleted BG content(${id}).`,
        type: "DELETE",
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
    const { agency_id } = req.agencyB2CUser;

    const popular_destinations = await configModel.getPopularDestination({
      agency_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: popular_destinations,
    };
  }

  public async createPopularDestination(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const CommonModel = this.Model.CommonModel(trx);
      const { agency_id, user_id } = req.agencyB2CUser;

      const body = req.body as ICreatePopularDestinationReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      if (!files.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Thumbnail is required",
        };
      }

      const checkCountry = await CommonModel.getCountry({
        id: body.country_id,
      });

      if (!checkCountry.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Country not found.",
        };
      }
      const checkFromAirport = await CommonModel.getAirport({
        id: body.from_airport,
      });

      if (!checkFromAirport.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "From Airport not found.",
        };
      }
      const toAirport = await CommonModel.getAirport({
        id: body.to_airport,
      });

      if (!toAirport.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "To Airport not found.",
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
        type: "CREATE",
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
      const { agency_id, user_id } = req.agencyB2CUser;
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

      if (body.country_id) {
        const checkCountry = await CommonModel.getCountry({
          id: body.country_id,
        });

        if (!checkCountry.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Country not found.",
          };
        }
      }

      if (body.from_airport) {
        const checkFromAirport = await CommonModel.getAirport({
          id: body.from_airport,
        });

        if (!checkFromAirport.data.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "From Airport not found.",
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
            message: "To Airport not found.",
          };
        }
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const payload: IUpdateAgencyB2CPopularDestinationPayload = body;

      if (files.length) {
        payload.thumbnail = files[0].filename;
      }

      await configModel.updatePopularDestination(payload, { agency_id, id });

      if (payload.thumbnail && check.thumbnail) {
        await this.manageFile.deleteFromCloud([check.thumbnail]);
      }
      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Popular destination(${id}) is updated.`,
        payload: JSON.stringify(payload),
        type: "UPDATE",
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
      const { agency_id, user_id } = req.agencyB2CUser;
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
        type: "DELETE",
      });

      if (check.thumbnail) {
        await this.manageFile.deleteFromCloud([check.thumbnail]);
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
    const { agency_id } = req.agencyB2CUser;

    const popular_places = await configModel.getPopularPlaces({
      agency_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: popular_places,
    };
  }

  public async createPopularPlace(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const CommonModel = this.Model.CommonModel(trx);
      const { agency_id, user_id } = req.agencyB2CUser;

      const body = req.body as ICreatePopularPlaceReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      if (!files.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Thumbnail is required",
        };
      }

      const checkCountry = await CommonModel.getCountry({
        id: body.country_id,
      });

      if (!checkCountry.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Country not found.",
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
        type: "CREATE",
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
      const { agency_id, user_id } = req.agencyB2CUser;
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
            message: "Country not found.",
          };
        }
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const payload: IUpdateAgencyB2CPopularPlace = body;

      if (files.length) {
        payload.thumbnail = files[0].filename;
      }

      await configModel.updatePopularPlace(payload, { agency_id, id });

      if (payload.thumbnail && check.thumbnail) {
        await this.manageFile.deleteFromCloud([check.thumbnail]);
      }

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Popular place(${id}) is updated.`,
        payload: JSON.stringify(payload),
        type: "UPDATE",
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
      const { agency_id, user_id } = req.agencyB2CUser;
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
        type: "DELETE",
      });

      if (check.thumbnail) {
        await this.manageFile.deleteFromCloud([check.thumbnail]);
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
    const { agency_id } = req.agencyB2CUser;

    const hotDeals = await configModel.getHotDeals({
      agency_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: hotDeals,
    };
  }

  public async createHotDeals(req: Request) {
    return this.db.transaction(async (trx) => {
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const { agency_id, user_id } = req.agencyB2CUser;

      const body = req.body as ICreateHotDealsReqBody;

      const files = (req.files as Express.Multer.File[]) || [];

      if (!files.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Thumbnail is required",
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
        type: "CREATE",
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
      const { agency_id, user_id } = req.agencyB2CUser;
      const configModel = this.Model.AgencyB2CConfigModel(trx);
      const CommonModel = this.Model.CommonModel(trx);

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

      await configModel.updateHotDeals(payload, { agency_id, id });

      if (payload.thumbnail && check.thumbnail) {
        await this.manageFile.deleteFromCloud([check.thumbnail]);
      }

      await this.insertAgentAudit(trx, {
        agency_id,
        created_by: user_id,
        details: `Hot deals(${id}) is updated.`,
        payload: JSON.stringify(payload),
        type: "UPDATE",
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
      const { agency_id, user_id } = req.agencyB2CUser;
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
        type: "DELETE",
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
