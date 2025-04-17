import { Knex } from "knex";
import AbstractServices from "../../../abstract/abstract.service";
import { getRedis } from "../../../app/redis";
import { FLIGHT_REVALIDATE_REDIS_KEY, MIN_DAYS_BEFORE_DEPARTURE_FOR_DIRECT_TICKET, SABRE_API } from "../../miscellaneous/flightConstent";
import { IFormattedFlightItinerary } from "../../supportTypes/flightTypes/commonFlightTypes";
import SabreFlightService from "./sabreFlightSupport.service";

export class CommonFlightSupportService extends AbstractServices {
    private trx: Knex.Transaction;
    constructor(trx?: Knex.Transaction) {
        super();
        this.trx = trx || {} as Knex.Transaction;
    }

    public async FlightRevalidate(payload: {
        search_id: string;
        flight_id: string;
        markup_set_id: number;
    }) {
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

        const apiData = await this.Model.MarkupSetFlightApiModel(this.trx).getMarkupSetFlightApi({
            status: true,
            markup_set_id,
            api_name: foundItem.api,
        });

        let booking_block = foundItem.booking_block;
        let revalidate_data: IFormattedFlightItinerary;

        if (foundItem.api === SABRE_API) {
            //SABRE REVALIDATE
            const sabreSubService = new SabreFlightService(this.trx);
            revalidate_data = await sabreSubService.SabreFlightRevalidate(
                retrievedData.reqBody,
                foundItem,
                markup_set_id,
                apiData[0].id,
                flight_id,
                booking_block
            );
        } else {
            return null;
        }
        revalidate_data.leg_description = retrievedData.response.leg_descriptions;
        revalidate_data.price_changed = this.checkRevalidatePriceChange({ flight_search_price: Number(foundItem?.fare.total_price), flight_revalidate_price: Number(revalidate_data.fare.total_price) });
        return revalidate_data;
    }


    private checkRevalidatePriceChange(payload: {
        flight_search_price: number;
        flight_revalidate_price: number;
    }) {
        if (payload.flight_search_price === payload.flight_revalidate_price) {
            return false;
        } else {
            return true;
        }
    }

    public async checkBookingPriceChange(payload: {
        flight_id: string;
        booking_price: number;
    }) {
        const retrievedData = await getRedis(`${FLIGHT_REVALIDATE_REDIS_KEY}${payload.flight_id}`) as IFormattedFlightItinerary;
        if (retrievedData.fare.total_price === payload.booking_price) {
            return false;
        } else {
            return true;
        }
    }

    public checkDirectTicketIssue(payload: { journey_date: string }): boolean {
        const now = new Date();
        const diffInMs = new Date(payload.journey_date).getTime() - now.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        return diffInDays < MIN_DAYS_BEFORE_DEPARTURE_FOR_DIRECT_TICKET;
    }
}