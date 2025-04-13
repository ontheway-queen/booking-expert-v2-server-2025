import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { ICreateMarkupSetReqBody, IPrePayloadSetMarkup, ISetSingleMarkupPayload } from "../utils/types/adminMarkupSetTypes";
import { MARKUP_SET_TYPE_FLIGHT } from "../../../utils/miscellaneous/constants";
import CustomError from "../../../utils/lib/customError";
import { ICreateFlightMarkupsPayload } from "../../../utils/modelTypes/markupSetModelTypes/flightMarkupsTypes";

export class AdminMarkupSetService extends AbstractServices {

    public async createMarkupSet(req: Request) {
        return this.db.transaction(async (trx) => {
            const { user_id } = req.admin;
            const { api, name } = req.body as ICreateMarkupSetReqBody;
            const markupSetModel = this.Model.MarkupSetModel(trx);
            const flightApiModel = this.Model.FlightApiModel(trx);
            const markupSetFlightApiModel = this.Model.MarkupSetFlightApiModel(trx);
            const flightMarkupsModel = this.Model.FlightMarkupsModel(trx);

            //check if markup set name already exists
            const checkName = await markupSetModel.getAllMarkupSet({
                check_name: name
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
                type: MARKUP_SET_TYPE_FLIGHT
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
}