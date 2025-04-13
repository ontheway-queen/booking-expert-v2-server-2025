import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { ICreateMarkupSetReqBody, IGetMarkupSetFlightApiFilter, IPrePayloadSetMarkup, ISetSingleMarkupPayload, IUpdateFlightMarkupsReqBody, IUpdateMarkupSetReqBody } from "../utils/types/adminMarkupSetTypes";
import { MARKUP_SET_TYPE_FLIGHT } from "../../../utils/miscellaneous/constants";
import CustomError from "../../../utils/lib/customError";
import { ICreateFlightMarkupsPayload } from "../../../utils/modelTypes/markupSetModelTypes/flightMarkupsTypes";
import { IGetMarkupListFilterQuery } from "../../../utils/modelTypes/markupSetModelTypes/markupSetModelTypes";

export class AdminMarkupSetService extends AbstractServices {

    public async createMarkupSet(req: Request) {
        return this.db.transaction(async (trx) => {
            const { user_id } = req.admin;
            const { api, name, type } = req.body as ICreateMarkupSetReqBody;
            const markupSetModel = this.Model.MarkupSetModel(trx);
            const flightApiModel = this.Model.FlightApiModel(trx);
            const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
            const flightMarkupsModel = this.Model.FlightMarkupsModel(trx);

            //check if markup set name already exists
            const checkName = await markupSetModel.getAllMarkupSet({
                check_name: name,
                type
            });

            if (checkName.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: "Markup Set name already exists"
                }
            }

            //create a markup set
            const newMarkupSet = await markupSetModel.createMarkupSet({
                name,
                created_by: user_id,
                type
            });

            const prePayload: IPrePayloadSetMarkup[] = [];

            for (const item of api) {
                const { api_id, airlines, ...rest } = item;
                const checkExisting = prePayload.find(
                    (singlePayload) => singlePayload.api_id === api_id
                );

                const markups: ISetSingleMarkupPayload[] = [];
                if (checkExisting) {
                    airlines.forEach((airline) => {
                        markups.push({
                            airline,
                            ...rest
                        });
                    });
                    checkExisting.markups = [
                        ...checkExisting.markups,
                        ...markups
                    ];
                } else {
                    airlines.forEach((airline) => {
                        markups.push({
                            airline,
                            ...rest
                        });
                    });
                    prePayload.push({
                        api_id,
                        markups,
                        set_id: newMarkupSet[0].id
                    });

                }
            }

            for (const item of prePayload) {
                const { api_id, set_id, markups } = item;

                const checkApi = await flightApiModel.getFlightApi({
                    id: api_id
                });

                if (!checkApi.length) {
                    throw new CustomError(
                        `Invalid api id: ${api_id}`,
                        this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
                    );
                }

                const newSetFlightApi = await markupSetFlightApiModel.createMarkupSetFlightApi({
                    markup_set_id: set_id,
                    flight_api_id: api_id
                });

                const airlinesMarkupPayload: ICreateFlightMarkupsPayload[] =
                    markups.map((markup) => ({
                        ...markup,
                        markup_set_flight_api_id: newSetFlightApi[0].id,
                        created_by: user_id
                    }));

                await flightMarkupsModel.createFlightMarkups(airlinesMarkupPayload);

            };

            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Markup Set has been created successfully",
            };
        });
    }

    public async getMarkupSet(req: Request) {
        return this.db.transaction(async (trx) => {
            const query = req.query as IGetMarkupListFilterQuery;
            const markupSetModel = this.Model.MarkupSetModel(trx);

            const data = await markupSetModel.getAllMarkupSet({ ...query, type: MARKUP_SET_TYPE_FLIGHT });

            return {
                success: true,
                data,
                code: this.StatusCode.HTTP_OK
            };
        });
    }


    public async getSingleMarkupSet(req: Request) {
        return this.db.transaction(async (trx) => {
            const { id } = req.params;

            const markupSetModel = this.Model.MarkupSetModel(trx);
            const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
            const markupSetData = await markupSetModel.getSingleMarkupSet(
                Number(id)
            );

            if (!markupSetData) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }

            const setFlightAPIData = await markupSetFlightApiModel.getMarkupSetFlightApi({
                markup_set_id: Number(id)
            });

            return {
                success: true,
                data: {
                    id: markupSetData.id,
                    name: markupSetData.name,
                    status: markupSetData.status,
                    api: setFlightAPIData,
                },
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };

        });
    }


    public async updateMarkupSet(req: Request) {
        return this.db.transaction(async (trx) => {
            const { name, add, update } = req.body as IUpdateMarkupSetReqBody;
            const { id } = req.params;
            const markupSetModel = this.Model.MarkupSetModel(trx);
            const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
            const flightApiModel = this.Model.FlightApiModel(trx);

            const checkComSet = await markupSetModel.getSingleMarkupSet(
                Number(id)
            );

            if (!checkComSet) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }

            if (name) {
                await markupSetModel.updateMarkupSet({ name }, Number(id));
            }

            if (add) {
                for (const item of add) {
                    const checkSetFlightApi = await markupSetFlightApiModel.getMarkupSetFlightApi({
                        markup_set_id: Number(id),
                        flight_api_id: item,
                    });

                    if (checkSetFlightApi.length) {
                        throw new CustomError(
                            `Api id ${item} already exist with this set`,
                            this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
                        );
                    }

                    const checkFlightApi = await flightApiModel.getFlightApi({
                        id: item,
                    });

                    if (!checkFlightApi.length) {
                        throw new CustomError(
                            `Invalid api id: ${item}`,
                            this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
                        );
                    }

                    await markupSetFlightApiModel.createMarkupSetFlightApi({
                        flight_api_id: item,
                        markup_set_id: Number(id),
                    });
                }
            }

            if (update) {
                for (const item of update) {
                    const { id, status } = item;
                    await markupSetFlightApiModel.updateMarkupSetFlightApi({ status }, id);
                }
            }

            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }

    public async deleteMarkupSet(req: Request) {
        return this.db.transaction(async (trx) => {
            const { id } = req.params;
            const markupSetModel = this.Model.MarkupSetModel(trx);
            const getMarkupSet = await markupSetModel.getSingleMarkupSet(Number(id));
            if (!getMarkupSet) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const update = await markupSetModel.updateMarkupSet({ is_deleted: true }, Number(id));

            if (update) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Markup Set has been deleted",
                }
            } else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR
                }
            }
        });
    }

    public async getMarkupSetFlightApiDetails(req: Request) {
        return this.db.transaction(async (trx) => {
            const { set_id, set_api_id } = req.params;
            const flightMarkupsModel = this.Model.FlightMarkupsModel(trx);
            const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
            const setFlightApiData = await markupSetFlightApiModel.getMarkupSetFlightApi({
                markup_set_id: Number(set_id),
                flight_api_id: Number(set_api_id)
            });
            if (!setFlightApiData.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                };
            }

            const { airline, status } = req.query as IGetMarkupSetFlightApiFilter;
            const { data, total } = await flightMarkupsModel.getAllFlightMarkups({
                markup_set_flight_api_id: setFlightApiData[0].id,
                airline,
                status
            });

            return {
                success: true,
                data,
                total,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }

    public async updateMarkupSetFlightApi(req: Request) {
        return this.db.transaction(async (trx) => {
            const { user_id } = req.admin;
            const { set_id, set_api_id } = req.params;
            const flightMarkupsModel = this.Model.FlightMarkupsModel(trx);
            const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
            const setFlightApiData = await markupSetFlightApiModel.getMarkupSetFlightApi({
                markup_set_id: Number(set_id),
                flight_api_id: Number(set_api_id)
            });
            if (!setFlightApiData.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                };
            }

            const { api_status, add, remove, update } = req.body as IUpdateFlightMarkupsReqBody;
            //update status
            if (api_status !== undefined) {
                await markupSetFlightApiModel.updateMarkupSetFlightApi({ status: api_status }, setFlightApiData[0].id);
            }

            //add new markup of airlines
            if (add) {
                const addPayload: ICreateFlightMarkupsPayload[] = [];

                for (const addItem of add) {
                    const {
                        airlines,
                        markup_domestic,
                        markup_from_dac,
                        markup_to_dac,
                        markup_soto,
                        markup_mode,
                        markup_type
                    } = addItem;

                    for (const airline of airlines) {
                        //check if airline already exists
                        const existingRecord = await flightMarkupsModel.getAllFlightMarkups({
                            airline,
                            markup_set_flight_api_id: setFlightApiData[0].id
                        });

                        if (existingRecord.data.length) {
                            await flightMarkupsModel.updateFlightMarkups({
                                markup_domestic,
                                markup_from_dac,
                                markup_mode,
                                markup_soto,
                                markup_to_dac,
                                markup_type,
                                updated_by: user_id,
                                updated_at: new Date()
                            }, existingRecord.data[0].key,);
                        } else {
                            addPayload.push({
                                airline,
                                markup_domestic,
                                markup_from_dac,
                                markup_mode,
                                markup_soto,
                                markup_to_dac,
                                markup_type,
                                created_by: user_id,
                                markup_set_flight_api_id: setFlightApiData[0].id
                            });
                        }
                    }

                    //insert the remaining payload
                    if (addPayload.length) {
                        await flightMarkupsModel.createFlightMarkups(addPayload);
                    }
                }
            }

            //update existing markup of airlines
            if (update) {
                for (const updateItem of update) {
                    const { id, ...rest } = updateItem;
                    await flightMarkupsModel.updateFlightMarkups({
                        ...rest,
                        updated_by: user_id,
                        updated_at: new Date()
                    }, id);
                }
            }

            //remove existing markup of airlines
            if (remove) {
                console.log({remove});
                await flightMarkupsModel.deleteFlightMarkups(remove);
            }

            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Markup set has been updated",
            };
        });
    }
}