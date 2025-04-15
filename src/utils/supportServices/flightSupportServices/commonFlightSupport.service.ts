import { Knex } from "knex";
import AbstractServices from "../../../abstract/abstract.service";
import { getRedis } from "../../../app/redis";
import { SABRE_API } from "../../miscellaneous/flightConstent";
import { IFormattedFlightItinerary } from "../../supportTypes/flightTypes/commonFlightTypes";
import SabreFlightService from "./sabreFlightSupport.service";

export class CommonFlightSupportService extends AbstractServices {
    private trx: Knex.Transaction;
    constructor(trx: Knex.Transaction) {
        super();
        this.trx = trx;
    }

    public async FlightRevalidate(payload: {
        search_id: string;
        flight_id: string;
        markup_set_id: number;
    }) {
        return this.db.transaction(async (trx) => {
            const { search_id, flight_id, markup_set_id } = payload;
            //get data from redis using the search id
            const retrievedData = await getRedis(search_id);

            if (!retrievedData) {
                return null;
            }

            const retrieveResponse = retrievedData.response as {
                results: IFormattedFlightItinerary[];
            };

            const foundItem = retrieveResponse.results.find(
                (item) => item.flight_id === flight_id
            );

            if (!foundItem) {
                return null;
            }

            const apiData = await this.Model.MarkupSetFlightApiModel(trx).getMarkupSetFlightApi({
                status: true,
                markup_set_id,
                api_name: foundItem.api,
            });

            let booking_block = foundItem.booking_block;

            if (foundItem.api === SABRE_API) {
                //SABRE REVALIDATE
                const sabreSubService = new SabreFlightService(trx);
                const formattedReqBody = await sabreSubService.SabreFlightRevalidate(
                    retrievedData.reqBody,
                    foundItem,
                    markup_set_id,
                    apiData[0].id,
                    flight_id,
                    booking_block
                );
                formattedReqBody[0].leg_description =
                    retrievedData.response.leg_descriptions;

                return formattedReqBody[0];
            } else {
                return null;
            }
        });
    }
}