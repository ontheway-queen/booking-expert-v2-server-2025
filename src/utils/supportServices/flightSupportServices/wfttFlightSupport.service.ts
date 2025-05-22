import { Knex } from "knex";
import AbstractServices from "../../../abstract/abstract.service";
import WfttRequests from "../../lib/flight/wfttRequest";
import { IFormattedFlightItinerary, IFlightSearchReqBody } from "../../supportTypes/flightTypes/commonFlightTypes";
import WfttAPIEndpoints from "../../miscellaneous/wfttApiEndpoints";
import { IWFTTFlightRevalidateRequestBody, IWFTTFlightRevalidateResponse, IWFTTFlightSearchResBody, IWFTTFlightSearchResults } from "../../supportTypes/flightTypes/wfttFlightTypes";
import { BD_AIRPORT } from "../../miscellaneous/staticData";
import { CUSTOM_API, MARKUP_MODE_INCREASE, MARKUP_TYPE_PER, WFTT_API } from "../../miscellaneous/flightConstent";
import Lib from "../../lib/lib";
import CustomError from "../../lib/customError";
import { ERROR_LEVEL_WARNING } from "../../miscellaneous/constants";

export default class WfttFlightService extends AbstractServices {
    private trx: Knex.Transaction;
    private request = new WfttRequests();
    constructor(trx: Knex.Transaction) {
        super();
        this.trx = trx;
    }

    // Flight search service
    public async FlightSearch({
        set_flight_api_id,
        booking_block,
        reqBody,
        markup_set_id,
    }: {
        reqBody: IFlightSearchReqBody;
        set_flight_api_id: number;
        markup_set_id: number;
        booking_block: boolean;
    }) {
        const response: IWFTTFlightSearchResBody | undefined = await this.request.postRequest(
            WfttAPIEndpoints.FLIGHT_SEARCH_ENDPOINT,
            reqBody
        );
        // return [response];

        if (!response) {
            return [];
        }
        if (response.data.total === 0) {
            return [];
        }

        const result = await this.FlightSearchResFormatter({
            data: response.data.results,
            reqBody: reqBody,
            set_flight_api_id,
            search_id: response.data.search_id
        });
        return result;
    }

    // Flight search response formatter
    private async FlightSearchResFormatter({
        data,
        reqBody,
        set_flight_api_id,
        search_id
    }: {
        data: IWFTTFlightSearchResults[];
        reqBody: IFlightSearchReqBody;
        set_flight_api_id: number;
        search_id: string;
    }) {
        // const result: IFormattedFlightItinerary[] = [];
        const airports: string[] = [];

        const OriginDest = reqBody.OriginDestinationInformation;

        OriginDest.forEach((item) => {
            airports.push(item.OriginLocation.LocationCode);
            airports.push(item.DestinationLocation.LocationCode);
        });

        const flightMarkupsModel = this.Model.FlightMarkupsModel(this.trx);
        return await Promise.all(data.map(async (item) => {
            const domestic_flight = item.isDomesticFlight;
            let fare = {
                base_fare: item.fare.base_fare,
                total_tax: item.fare.total_tax,
                discount: item.fare.discount,
                convenience_fee: item.fare.convenience_fee,
                total_price: item.fare.total_price,
                payable: item.fare.payable,
                ait: item.fare.ait,
            }

            // Markup data
            let finalMarkup = 0;
            let finalMarkupType = '';
            let finalMarkupMode = '';
            // Set Markup if route Markup is not available and airlines Markup is available
            if (!finalMarkup && !finalMarkupType && !finalMarkupMode) {
                //airline markup
                const markupCheck = await flightMarkupsModel.getAllFlightMarkups(
                    {
                        airline: item.carrier_code,
                        status: true,
                        markup_set_flight_api_id: set_flight_api_id,
                        limit: 1,
                    },
                    false
                );

                // Set Amount
                if (markupCheck.data.length) {
                    const {
                        markup_domestic,
                        markup_from_dac,
                        markup_to_dac,
                        markup_soto,
                        markup_type,
                        markup_mode,
                    } = markupCheck.data[0];

                    let allBdAirport = true;
                    let existBdAirport = false;

                    for (const airport of airports) {
                        if (BD_AIRPORT.includes(airport)) {
                            if (!existBdAirport) {
                                existBdAirport = true;
                            }
                        } else {
                            allBdAirport = false;
                        }
                    }

                    if (allBdAirport) {
                        // Domestic
                        finalMarkup = markup_domestic;
                        finalMarkupMode = markup_mode;
                        finalMarkupType = markup_type;
                    } else if (BD_AIRPORT.includes(airports[0])) {
                        // From Dhaka
                        finalMarkup = markup_from_dac;
                        finalMarkupMode = markup_mode;
                        finalMarkupType = markup_type;
                    } else if (existBdAirport) {
                        // To Dhaka
                        finalMarkup = markup_to_dac;
                        finalMarkupMode = markup_mode;
                        finalMarkupType = markup_type;
                    } else {
                        // Soto
                        finalMarkup = markup_soto;
                        finalMarkupMode = markup_mode;
                        finalMarkupType = markup_type;
                    }
                }
            }

            // Set Markup to fare
            if (finalMarkup && finalMarkupMode && finalMarkupType) {
                if (finalMarkupType === MARKUP_TYPE_PER) {
                    const markupAmount =
                        (Number(fare.base_fare) * Number(finalMarkup)) / 100;

                    if (finalMarkupMode === MARKUP_MODE_INCREASE) {
                        fare.convenience_fee += Number(markupAmount);
                    } else {
                        fare.discount += Number(markupAmount);
                    }
                } else {
                    if (finalMarkupMode === MARKUP_MODE_INCREASE) {
                        fare.convenience_fee += Number(finalMarkup);
                    } else {
                        fare.discount += Number(finalMarkup);
                    }
                }
            }

            fare.payable =
                Number(fare.total_price) +
                Number(fare.convenience_fee) -
                Number(fare.discount);

            const { isDomesticFlight, fare: wftt_fare, api, api_search_id, ...rest } = item;
            return {
                domestic_flight,
                fare,
                price_changed: false,
                api_search_id: search_id,
                api: CUSTOM_API,
                ...rest,
                leg_description: [],
            }
        })) as IFormattedFlightItinerary[];
    }

    //Revalidate service
    public async FlightRevalidate({
        reqBody,
        revalidate_body,
        set_flight_api_id
    }: {
        revalidate_body: IWFTTFlightRevalidateRequestBody;
        reqBody: IFlightSearchReqBody;
        set_flight_api_id: number;
    }) {
        const response: IWFTTFlightRevalidateResponse = await this.request.getRequest(
            WfttAPIEndpoints.FLIGHT_REVALIDATE_ENDPOINT,
            revalidate_body
        );
        
        if (!response) {
            Lib.writeJsonFile('wftt_revalidate_request', revalidate_body);
            Lib.writeJsonFile('wftt_revalidate_response', response);
            throw new CustomError('External API Error', 500, ERROR_LEVEL_WARNING, {
                api: WFTT_API,
                endpoint: WfttAPIEndpoints.FLIGHT_REVALIDATE_ENDPOINT,
                payload: revalidate_body,
                response
            });
        }

        if (!response.data) {
            throw new CustomError(
                `Cannot revalidate flight with this flight id`,
                400
            );
        }


        const result = await this.FlightSearchResFormatter({
            data: [response.data],
            reqBody: reqBody,
            set_flight_api_id,
            search_id: ""
        });
        return result[0];
    }
}
