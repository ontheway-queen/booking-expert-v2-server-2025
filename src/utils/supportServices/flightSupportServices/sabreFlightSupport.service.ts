import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import CustomError from '../../lib/customError';
import FlightUtils from '../../lib/flight/flightUtils';
import SabreRequests from '../../lib/flight/sabreRequest';
import Lib from '../../lib/lib';
import { ERROR_LEVEL_WARNING, PROJECT_EMAIL } from '../../miscellaneous/constants';
import { FLIGHT_BOOKING_CANCELLED, FLIGHT_BOOKING_REFUNDED, FLIGHT_BOOKING_VOID, FLIGHT_TICKET_ISSUE, MARKUP_MODE_INCREASE, MARKUP_TYPE_PER, SABRE_API, SABRE_FLIGHT_ITINS } from '../../miscellaneous/flightConstent';
import SabreAPIEndpoints from '../../miscellaneous/sabreApiEndpoints';
import { BD_AIRPORT } from '../../miscellaneous/staticData';
import { IFormattedFlight, IFormattedFlightItinerary, IFlightSearchReqBody, IFlightAvailability, IFlightDataAvailabilitySegment } from '../../supportTypes/flightTypes/commonFlightTypes';
import { IBaggageAndAvailabilityAllSeg, IBaggageAndAvailabilityAllSegSegmentDetails, IContactNumber, IFormattedArrival, IFormattedCarrier, IFormattedDeparture, IFormattedLegDesc, IFormattedScheduleDesc, ILegDescOption, ISabreNewPassenger, ISabreResponseResult, ISecureFlight, OriginDestinationInformation } from '../../supportTypes/flightTypes/sabreFlightTypes';
import { CommonFlightSupportService } from './commonFlightSupport.service';
import { IFlightBookingRequestBody } from '../../supportTypes/bookingSupportTypes/flightBookingSupportTypes/commonFlightBookingTypes';
export default class SabreFlightService extends AbstractServices {
  private trx: Knex.Transaction;
  private request = new SabreRequests();
  private flightUtils = new FlightUtils();
  constructor(trx: Knex.Transaction) {
    super();
    this.trx = trx;
  }


  ////////////==================FLIGHT SEARCH (START)=========================///////////
  // Flight Search Request formatter
  private async FlightReqFormatterV5(
    body: IFlightSearchReqBody,
    set_flight_api_id: number
  ) {
    const flightMarkupsModel = this.Model.FlightMarkupsModel(this.trx);
    const cappingAirlines: { Code: string }[] =
      await flightMarkupsModel.getAPIActiveAirlines(set_flight_api_id);

    const airlines: { Code: string }[] = [];
    for (const airline of cappingAirlines) {
      if (String(airline.Code) === String(body?.airline_code?.[0]?.Code)) {
        airlines.push(airline);
      }
    }

    const originDestinationInfo: OriginDestinationInformation[] = [];
    body.OriginDestinationInformation.forEach((item) => {
      let cabin = 'Y';
      switch (item.TPA_Extensions.CabinPref.Cabin) {
        case '1':
          cabin = 'Y';
          break;
        case '2':
          cabin = 'S';
          break;
        case '3':
          cabin = 'C';
          break;
        case '4':
          cabin = 'F';
          break;

        default:
          break;
      }
      originDestinationInfo.push({
        ...item,
        TPA_Extensions: {
          CabinPref: {
            Cabin: cabin,
            PreferLevel: item.TPA_Extensions.CabinPref.PreferLevel,
          },
        },
      });
    });

    const reqBody = {
      OTA_AirLowFareSearchRQ: {
        Version: '5',
        POS: {
          Source: [
            {
              PseudoCityCode: config.SABRE_USERNAME.split('-')[1],
              RequestorID: {
                Type: '1',
                ID: '1',
                CompanyName: {
                  Code: 'TN',
                  content: 'TN',
                },
              },
            },
          ],
        },
        AvailableFlightsOnly: true,
        OriginDestinationInformation: originDestinationInfo,
        TravelPreferences: {
          VendorPref: airlines.length ? airlines : cappingAirlines,
          TPA_Extensions: {
            LongConnectTime: {
              Enable: true,
              Max: 1439,
              Min: 59,
            },
            XOFares: {
              Value: true,
            },
            KeepSameCabin: {
              Enabled: true,
            },
          },
        },
        TravelerInfoSummary: {
          SeatsRequested: [1],
          AirTravelerAvail: [
            {
              PassengerTypeQuantity: body.PassengerTypeQuantity,
            },
          ],
        },
        TPA_Extensions: {
          IntelliSellTransaction: {
            RequestType: {
              Name: SABRE_FLIGHT_ITINS,
            },
          },
        },
      },
    };

    return reqBody;
  }

  // Flight search service
  public async FlightSearch({
    set_flight_api_id,
    booking_block,
    reqBody,
    markup_set_id,
    markup_amount
  }: {
    reqBody: IFlightSearchReqBody;
    set_flight_api_id: number;
    markup_set_id: number;
    booking_block: boolean;
    markup_amount?: {
      markup: number;
      markup_type: "PER" | "FLAT",
      markup_mode: "INCREASE" | "DECREASE"
    }
  }) {
    const flightRequestBody = await this.FlightReqFormatterV5(
      reqBody,
      set_flight_api_id
    );

    const response = await this.request.postRequest(
      SabreAPIEndpoints.FLIGHT_SEARCH_ENDPOINT_V5,
      flightRequestBody
    );
    // return [response];

    if (!response) {
      return [];
    }
    if (response.groupedItineraryResponse.statistics.itineraryCount === 0) {
      return [];
    }
    const result = await this.FlightSearchResFormatter({
      data: response.groupedItineraryResponse,
      reqBody: reqBody,
      set_flight_api_id,
      booking_block,
      markup_set_id,
      markup_amount
    });
    return result;
  }

  // Flight search Response formatter
  private async FlightSearchResFormatter({
    set_flight_api_id,
    booking_block,
    data,
    reqBody,
    markup_set_id,
    flight_id,
    markup_amount
  }: {
    data: ISabreResponseResult;
    reqBody: IFlightSearchReqBody;
    set_flight_api_id: number;
    markup_set_id: number;
    booking_block: boolean;
    flight_id?: string;
    markup_amount?: {
      markup: number;
      markup_type: "PER" | "FLAT";
      markup_mode: "INCREASE" | "DECREASE";
    }
  }) {
    const commonModel = this.Model.CommonModel(this.trx);
    const flightMarkupsModel = this.Model.FlightMarkupsModel(this.trx);
    // const routeConfigModel = this.Model.flightRouteConfigModel(this.trx);
    const airports: string[] = [];

    const OriginDest = reqBody.OriginDestinationInformation;

    OriginDest.forEach((item) => {
      airports.push(item.OriginLocation.LocationCode);
      airports.push(item.DestinationLocation.LocationCode);
    });

    let domestic_flight = airports.every((airport) =>
      BD_AIRPORT.includes(airport)
    );
    const scheduleDesc: IFormattedScheduleDesc[] = [];

    for (const item of data.scheduleDescs) {
      const dAirport = await commonModel.getAirport({ code: item.departure.airport });
      const AAirport = await commonModel.getAirport({ code: item.arrival.airport });
      const DCity = await commonModel.getCity({ code: item.departure.city });
      const ACity = await commonModel.getCity({ code: item.arrival.city });
      const marketing_airline = await commonModel.getAirlines(
        { code: item.carrier.marketing }, false
      );
      const aircraft = await commonModel.getAircraft(
        item.carrier.equipment.code
      );
      let operating_airline = marketing_airline;

      if (item.carrier.marketing !== item.carrier.operating) {
        operating_airline = await commonModel.getAirlines(
          { code: item.carrier.operating }, false
        );
      }

      const departure: IFormattedDeparture = {
        airport_code: item.departure.airport,
        city_code: item.departure.city,
        airport: dAirport.data?.[0]?.name || "-",
        city: DCity?.[0]?.name || "-",
        country: item.departure.country,
        terminal: item.departure.terminal,
        time: item.departure.time,
        date: '',
        date_adjustment: item.departure.dateAdjustment,
      };

      const arrival: IFormattedArrival = {
        airport: AAirport.data?.[0]?.name || "-",
        city: ACity?.[0]?.name || "-",
        airport_code: item.arrival.airport,
        city_code: item.arrival.city,
        country: item.arrival.country,
        time: item.arrival.time,
        terminal: item.arrival.terminal,
        date: '',
        date_adjustment: item.arrival.dateAdjustment,
      };

      const carrier: IFormattedCarrier = {
        carrier_marketing_code: item.carrier.marketing,
        carrier_marketing_airline: marketing_airline.data?.[0]?.name || "-",
        carrier_marketing_logo: marketing_airline.data?.[0]?.logo || "-",
        carrier_marketing_flight_number: String(item.carrier.marketingFlightNumber),
        carrier_operating_code: item.carrier.operating,
        carrier_operating_airline: operating_airline.data?.[0]?.name || "-",
        carrier_operating_logo: operating_airline.data?.[0]?.logo || "-",
        carrier_operating_flight_number: String(item.carrier.operatingFlightNumber),
        carrier_aircraft_code: aircraft.code,
        carrier_aircraft_name: aircraft.name,
      };

      const new_item: IFormattedScheduleDesc = {
        id: item.id,
        elapsedTime: item.elapsedTime,
        stopCount: item.stopCount,
        message: item.message,
        message_type: item.messageType,
        total_miles_flown: item.totalMilesFlown,
        departure,
        arrival,
        carrier,
      };
      scheduleDesc.push(new_item);
    }

    const legDesc: IFormattedLegDesc[] = data.legDescs.map((leg) => {
      const schedules = leg.schedules;

      const options: ILegDescOption[] = [];

      for (const schedule of schedules) {
        const founded = scheduleDesc.find((item) => item.id === schedule.ref);

        if (founded) {
          options.push({
            ...founded,
            departureDateAdjustment: schedule.departureDateAdjustment,
          });
        }
      }

      return {
        id: leg.id,
        elapsed_time: leg.elapsedTime,
        options,
      };
    });

    const itineraryGroup = data.itineraryGroups[0];

    const itineraries: IFormattedFlightItinerary[] = [];

    for (let i = 0; i < itineraryGroup.itineraries.length; i++) {
      const itinerary = itineraryGroup.itineraries[i];
      const fare = itinerary.pricingInformation[0].fare;

      const passenger_lists: ISabreNewPassenger[] = [];
      let refundable: boolean = false;

      const baggageAndAvailabilityAllSeg: IBaggageAndAvailabilityAllSeg[] = [];

      for (const passenger of fare.passengerInfoList) {
        const passenger_info = passenger.passengerInfo;
        refundable = !passenger_info.nonRefundable;

        const segmentDetails: IBaggageAndAvailabilityAllSegSegmentDetails[] =
          [];

        let legInd = 0;
        let segInd = 0;
        let segments: any[] = [];

        for (let i = 0; i < passenger_info.fareComponents.length; i++) {
          const pfd = passenger_info.fareComponents[i];

          for (let j = 0; j < pfd.segments.length; j++) {
            const segd = pfd.segments[j];
            const segment = segd?.segment;
            if (segment !== undefined) {
              const meal_type = this.flightUtils.getMeal(segment?.mealCode || '');
              const cabin_type = this.flightUtils.getCabin(segment?.cabinCode || '');
              segments.push({
                id: j + 1,
                name: `Segment-${j + 1}`,
                meal_type: meal_type?.name,
                meal_code: meal_type?.code,
                cabin_code: cabin_type?.code,
                cabin_type: cabin_type?.name,
                booking_code: segment?.bookingCode,
                available_seat: segment?.seatsAvailable,
                available_break: segment?.availabilityBreak,
                available_fare_break: segment?.fareBreakPoint,
              });
            }
            segInd++;
          }

          let newBaggage: any = {};

          if (passenger_info.baggageInformation) {
            const baggage = passenger_info.baggageInformation[i];
            if (baggage) {
              const allowance_id = baggage?.allowance?.ref;
              newBaggage = data.baggageAllowanceDescs.find(
                (all_item) => all_item.id === allowance_id
              );
            }
          }

          //all the segments are in one fareComponents object for each leg
          if (
            pfd.endAirport ===
            reqBody.OriginDestinationInformation[legInd].DestinationLocation
              .LocationCode
          ) {
            legInd++;
            segInd = 0;
          }
          //segments are in different fareComponents object for each leg
          else {
            continue;
          }

          segmentDetails.push({
            id: i + 1,
            from_airport:
              reqBody.OriginDestinationInformation[legInd - 1].OriginLocation
                .LocationCode,
            to_airport:
              reqBody.OriginDestinationInformation[legInd - 1]
                .DestinationLocation.LocationCode,
            segments,
            baggage: newBaggage?.id
              ? {
                id: newBaggage?.id,
                unit: newBaggage.unit || 'pieces',
                count: newBaggage.weight || newBaggage.pieceCount,
              }
              : {
                id: 1,
                unit: 'N/A',
                count: 'N/A',
              },
          });
          segments = [];
        }

        baggageAndAvailabilityAllSeg.push({
          passenger_type: passenger.passengerInfo.passengerType,
          passenger_count: passenger.passengerInfo.passengerNumber,
          segmentDetails,
        });

        const new_passenger: ISabreNewPassenger = {
          type: passenger_info.passengerType,
          number: passenger_info.passengerNumber,

          fare: {
            total_fare: passenger_info.passengerTotalFare.totalFare,
            tax: passenger_info.passengerTotalFare.totalTaxAmount,
            base_fare: passenger_info.passengerTotalFare.equivalentAmount,
          },
        };

        passenger_lists.push(new_passenger);
      }

      const legsDesc: IFormattedFlight[] = this.flightUtils.getLegsDesc(
        itinerary.legs,
        legDesc,
        OriginDest
      );

      const validatingCarrier = await commonModel.getAirlines(
        { code: fare.validatingCarrierCode }, false
      );

      // Markup data
      let finalMarkup = 0;
      let finalMarkupType = '';
      let finalMarkupMode = '';

      // const routeMarkupCheck = await routeConfigModel.getSetRoutesCommission(
      //   {
      //     status: true,
      //     departure: airports[0],
      //     arrival: airports[1],
      //     markup_set_id,
      //   },
      //   false
      // );

      // // Set markup if route markup is available
      // if (routeMarkupCheck.data.length) {
      //   if (routeMarkupCheck.data.length > 1) {
      //     const routeMarkupFoundOfAirline = routeMarkupCheck.data.find(
      //       (item) => item.airline === fare.validatingCarrierCode
      //     );
      //     if (routeMarkupFoundOfAirline) {
      //       const { markup, markup_type, markup_mode } = routeMarkupFoundOfAirline;
      //       finalMarkup = markup;
      //       finalMarkupMode = markup_mode;
      //       finalMarkupType = markup_type;
      //     }
      //   } else {
      //     const { markup, markup_type, markup_mode, airline } =
      //       routeMarkupCheck.data[0];

      //     if (!airline || airline === fare.validatingCarrierCode) {
      //       finalMarkup = markup;
      //       finalMarkupMode = markup_mode;
      //       finalMarkupType = markup_type;
      //     }
      //   }
      // }

      // Set Markup if route Markup is not available and airlines Markup is available
      if (!finalMarkup && !finalMarkupType && !finalMarkupMode) {
        //airline markup
        const markupCheck = await flightMarkupsModel.getAllFlightMarkups(
          {
            airline: fare.validatingCarrierCode,
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

      const ait = Math.round(((Number(fare.totalFare.equivalentAmount) + Number(fare.totalFare.totalTaxAmount)) / 100) * 0.3);
      const new_fare = {
        base_fare: fare.totalFare.equivalentAmount,
        total_tax: Number(fare.totalFare.totalTaxAmount),
        ait,
        discount: 0,
        convenience_fee: 0,
        total_price: Number(fare.totalFare.totalPrice) + ait,
        payable: Number(fare.totalFare.totalPrice) + ait,
      };

      // Set Markup to fare
      if (finalMarkup && finalMarkupMode && finalMarkupType) {
        if (finalMarkupType === MARKUP_TYPE_PER) {
          const markupAmount =
            (Number(new_fare.base_fare) * Number(finalMarkup)) / 100;

          if (finalMarkupMode === MARKUP_MODE_INCREASE) {
            new_fare.convenience_fee += Number(markupAmount);
          } else {
            new_fare.discount += Number(markupAmount);
          }
        } else {
          if (finalMarkupMode === MARKUP_MODE_INCREASE) {
            new_fare.convenience_fee += Number(finalMarkup);
          } else {
            new_fare.discount += Number(finalMarkup);
          }
        }
      }

      //add addition markup(applicable for sub agent/agent b2c)
      if (markup_amount) {
        if (markup_amount.markup_mode === 'INCREASE') {

          new_fare.convenience_fee += markup_amount.markup_type === 'FLAT' ? Number(markup_amount.markup) : (Number(new_fare.total_price) * Number(markup_amount.markup)) / 100;
        } else {
          new_fare.discount += markup_amount.markup_type === 'FLAT' ? Number(markup_amount.markup) : (Number(new_fare.total_price) * Number(markup_amount.markup)) / 100;
        }
      }

      new_fare.payable =
        Number(new_fare.total_price) +
        Number(new_fare.convenience_fee) -
        Number(new_fare.discount);

      const availability: IFlightAvailability[] = [];

      baggageAndAvailabilityAllSeg.forEach((item) => {
        const { segmentDetails } = item;
        segmentDetails.forEach((item2) => {
          const foundData = availability.find(
            (avItem) =>
              avItem.from_airport === item2.from_airport &&
              avItem.to_airport === item2.to_airport
          );

          if (foundData) {
            const { segments } = foundData;
            item2.segments.forEach((item3) => {
              const segmentFound = segments.find(
                (segs) => item3.name === segs.name
              );

              if (segmentFound) {
                const passenger = segmentFound.passenger.find(
                  (pas) => pas.type === item.passenger_type
                );

                if (!passenger) {
                  segmentFound.passenger.push({
                    type: item.passenger_type,
                    count: item.passenger_count,
                    meal_type: item3.meal_type,
                    meal_code: item3.meal_code,
                    cabin_code: item3.cabin_code,
                    cabin_type: item3.cabin_type,
                    booking_code: item3.booking_code,
                    available_seat: item3.available_seat,
                    available_break: item3.available_break,
                    available_fare_break: item3.available_fare_break,
                    baggage_unit: item2.baggage.unit,
                    baggage_count: item2.baggage.count,
                  });
                }
              } else {
                segments.push({
                  name: item3.name,
                  passenger: [
                    {
                      type: item.passenger_type,
                      count: item.passenger_count,
                      meal_type: item3.meal_type,
                      meal_code: item3.meal_code,
                      cabin_code: item3.cabin_code,
                      cabin_type: item3.cabin_type,
                      booking_code: item3.booking_code,
                      available_seat: item3.available_seat,
                      available_break: item3.available_break,
                      available_fare_break: item3.available_fare_break,
                      baggage_unit: item2.baggage.unit,
                      baggage_count: item2.baggage.count,
                    },
                  ],
                });
              }
            });
          } else {
            const segments: IFlightDataAvailabilitySegment[] = [];

            item2.segments.forEach((item3) => {
              segments.push({
                name: item3.name,
                passenger: [
                  {
                    type: item.passenger_type,
                    count: item.passenger_count,
                    meal_type: item3.meal_type,
                    meal_code: item3.meal_code,
                    cabin_code: item3.cabin_code,
                    cabin_type: item3.cabin_type,
                    booking_code: item3.booking_code,
                    available_seat: item3.available_seat,
                    available_break: item3.available_break,
                    available_fare_break: item3.available_fare_break,
                    baggage_unit: item2.baggage.unit,
                    baggage_count: item2.baggage.count,
                  },
                ],
              });
            });
            availability.push({
              from_airport: item2.from_airport,
              to_airport: item2.to_airport,
              segments,
            });
          }
        });
      });

      const itinery: IFormattedFlightItinerary = {
        flight_id: flight_id || uuidv4(),
        api_search_id: '',
        booking_block,
        domestic_flight,
        price_changed: false,
        direct_ticket_issue: new CommonFlightSupportService().checkDirectTicketIssue({ journey_date: reqBody.OriginDestinationInformation[0].DepartureDateTime }),
        journey_type: reqBody.JourneyType,
        api: SABRE_API,
        fare: new_fare,
        refundable,
        carrier_code: fare.validatingCarrierCode,
        carrier_name: validatingCarrier.data?.[0]?.name || "-",
        carrier_logo: validatingCarrier.data?.[0]?.logo || "-",
        ticket_last_date: fare.lastTicketDate,
        ticket_last_time: fare.lastTicketTime,
        flights: legsDesc,
        passengers: passenger_lists,
        availability,
        leg_description: [],
      };

      itineraries.push(itinery);
    }

    return itineraries;
  }

  ///==================FLIGHT SEARCH (END)=========================///

  //////==================FLIGHT REVALIDATE (START)=========================//////
  //sabre flight revalidate service
  public async SabreFlightRevalidate(
    {
      reqBody,
      retrieved_response,
      markup_set_id,
      set_flight_api_id,
      flight_id,
      booking_block,
      markup_amount
    }:
      {
        reqBody: IFlightSearchReqBody;
        retrieved_response: IFormattedFlightItinerary;
        markup_set_id: number;
        set_flight_api_id: number;
        flight_id: string;
        booking_block: boolean;
        markup_amount?: {
          markup: number;
          markup_type: "PER" | "FLAT";
          markup_mode: "INCREASE" | "DECREASE";
        }
      }
  ) {
    const revalidate_req_body = await this.RevalidateFlightReqFormatter(
      reqBody,
      retrieved_response
    );

    const response = await this.request.postRequest(
      SabreAPIEndpoints.FLIGHT_REVALIDATE_ENDPOINT,
      revalidate_req_body
    );
    if (!response) {
      Lib.writeJsonFile('sabre_revalidate_request', revalidate_req_body);
      Lib.writeJsonFile('sabre_revalidate_response', response);
      throw new CustomError('External API Error', 500);
    }

    if (response.groupedItineraryResponse?.statistics.itineraryCount === 0) {
      Lib.writeJsonFile('sabre_revalidate_request', revalidate_req_body);
      Lib.writeJsonFile('sabre_revalidate_response', response);

      throw new CustomError(
        `Cannot revalidate flight with this flight id`,
        400
      );
    }

    const data = await this.FlightSearchResFormatter({
      set_flight_api_id,
      booking_block,
      reqBody,
      data: response.groupedItineraryResponse,
      markup_set_id,
      flight_id,
      markup_amount
    });

    return data[0];
  }

  // Revalidate Flight Request Formatter
  public async RevalidateFlightReqFormatter(
    reqBody: IFlightSearchReqBody,
    retrieved_response: IFormattedFlightItinerary
  ) {
    let cabin = 'Y';
    switch (
    reqBody.OriginDestinationInformation[0]?.TPA_Extensions?.CabinPref?.Cabin
    ) {
      case '1':
        cabin = 'Y';
        break;
      case '2':
        cabin = 'S';
        break;
      case '3':
        cabin = 'C';
        break;
      case '4':
        cabin = 'F';
        break;

      default:
        break;
    }
    const OriginDestinationInformation =
      reqBody.OriginDestinationInformation.map((item, index) => {
        const req_depart_air = item.OriginLocation.LocationCode;
        const flights: any[] = [];
        const flight = retrieved_response.flights[index];

        const depart_time = flight.options[0].departure.time;
        const depart_air = flight.options[0].departure.airport_code;

        if (req_depart_air === depart_air) {
          for (const option of flight.options) {
            const DepartureDateTime = this.flightUtils.convertDateTime(
              option.departure.date,
              option.departure.time
            );
            const ArrivalDateTime = this.flightUtils.convertDateTime(
              option.arrival.date,
              option.arrival.time
            );

            const flight_data = {
              Number: Number(option?.carrier.carrier_marketing_flight_number),
              ClassOfService: 'V',
              DepartureDateTime,
              ArrivalDateTime,
              Type: 'A',
              OriginLocation: {
                LocationCode: option?.departure.airport_code,
              },
              DestinationLocation: {
                LocationCode: option?.arrival.airport_code,
              },
              Airline: {
                Marketing: option?.carrier.carrier_marketing_code,
                Operating: option?.carrier.carrier_operating_code,
              },
            };

            flights.push(flight_data);
          }

          const origin_destination_info = {
            RPH: item.RPH,
            DepartureDateTime: this.flightUtils.convertDateTime(
              item.DepartureDateTime,
              depart_time
            ),

            OriginLocation: item['OriginLocation'],
            DestinationLocation: item['DestinationLocation'],
            TPA_Extensions: {
              Flight: flights,
            },
          };

          return origin_destination_info;
        }
      });

    const PassengerTypeQuantity = reqBody.PassengerTypeQuantity.map((item) => {
      const passenger_info = {
        Code: item.Code,
        Quantity: item.Quantity,
        TPA_Extensions: {
          VoluntaryChanges: {
            Match: 'Info',
          },
        },
      };
      return passenger_info;
    });

    const request_body = {
      OTA_AirLowFareSearchRQ: {
        POS: {
          Source: [
            {
              PseudoCityCode: config.SABRE_USERNAME.split('-')[1],
              RequestorID: {
                Type: '1',
                ID: '1',
                CompanyName: {
                  Code: 'TN',
                },
              },
            },
          ],
        },
        OriginDestinationInformation: OriginDestinationInformation,
        TPA_Extensions: {
          IntelliSellTransaction: {
            CompressResponse: {
              Value: false,
            },
            RequestType: {
              Name: '50ITINS',
            },
          },
        },
        TravelerInfoSummary: {
          AirTravelerAvail: [
            {
              PassengerTypeQuantity: PassengerTypeQuantity,
            },
          ],
          SeatsRequested: [1],
        },
        TravelPreferences: {
          TPA_Extensions: {
            DataSources: {
              NDC: 'Disable',
              ATPCO: 'Enable',
              LCC: 'Disable',
            },
            VerificationItinCallLogic: {
              AlwaysCheckAvailability: true,
              Value: 'L',
            },
            // FlexibleFares: {
            //   FareParameters: [
            //     {
            //       Cabin: {
            //         Type: cabin,
            //       },
            //     },
            //   ],
            // },
          },
        },
        Version: '5',
      },
    };
    return request_body;
  }

  ///==================FLIGHT REVALIDATE (END)=========================///

  /////////==================FLIGHT BOOKING (START)=========================/////////
  //pnr create request formatter
  private async pnrReqBody(
    body: IFlightBookingRequestBody,
    foundItem: IFormattedFlightItinerary,
    user_info: { email: string; phone: string; name: string }
  ) {
    const formattedDate = (dateString: string | Date) =>
      `${String(new Date(dateString).getDate()).padStart(2, '0')}${new Date(
        dateString
      )
        .toLocaleString('default', { month: 'short' })
        .toUpperCase()}${String(new Date(dateString).getFullYear()).slice(-2)}`;
    const monthDiff = (date: string | Date): string => {
      const diff = Math.ceil(
        (new Date().getTime() - new Date(date).getTime()) /
        (1000 * 60 * 60 * 24 * 30)
      );
      return String(diff).padStart(2, '0');
    };

    const passengers = body.passengers;
    const filteredPassengers = passengers.filter(
      (passenger) => passenger.type !== 'INF'
    );
    const passengerLength = filteredPassengers.length;

    const SecureFlight: ISecureFlight[] = [];
    const AdvancePassenger: any[] = [];
    const Service = [];
    const ContactNumber: IContactNumber[] = [];

    Service.push({
      SSR_Code: 'CTCM',
      Text: user_info.phone,
      PersonName: {
        NameNumber: '1.1',
      },
      SegmentNumber: 'A',
    });

    Service.push({
      SSR_Code: 'OTHS',
      Text: user_info.name,
      PersonName: {
        NameNumber: '1.1',
      },
      SegmentNumber: 'A',
    });

    Service.push({
      SSR_Code: 'CTCE',
      Text: PROJECT_EMAIL.replace('@', '//'),
      PersonName: {
        NameNumber: '1.1',
      },
      SegmentNumber: 'A',
    });

    ContactNumber.push({
      NameNumber: '1.1',
      Phone: user_info.phone,
      PhoneUseType: 'M',
    });

    const Email: any[] = [];

    Email.push({
      NameNumber: '1.1',
      Address: PROJECT_EMAIL,
      Type: 'CC',
    });

    let inf_ind = 1;

    const PersonName = await Promise.all(
      passengers.map(async (item, index) => {
        const name_number = `${index + 1}.1`;

        const secure_fl_data = {
          PersonName: {
            NameNumber: item.type === 'INF' ? inf_ind + '.1' : name_number,
            DateOfBirth: String(item.date_of_birth)?.split('T')[0],
            Gender:
              item.type === 'INF' && item.gender === 'Male'
                ? 'MI'
                : item.type === 'INF' && item.gender === 'Female'
                  ? 'FI'
                  : item.gender[0],
            GivenName: item.first_name,
            Surname: item.last_name,
          },
          SegmentNumber: 'A',
          VendorPrefs: {
            Airline: {
              Hosted: false,
            },
          },
        };

        if (item.type.startsWith('C')) {
          Service.push({
            SSR_Code: 'CHLD',
            Text: formattedDate(item.date_of_birth),
            PersonName: {
              NameNumber: name_number,
            },
            SegmentNumber: 'A',
          });
        }

        if (item.type === 'INF') {
          Service.push({
            SSR_Code: 'INFT',
            Text:
              item.first_name +
              '/' +
              item.last_name +
              '/' +
              formattedDate(item.date_of_birth),
            PersonName: {
              NameNumber: inf_ind + '.1',
            },
            SegmentNumber: 'A',
          });
        }

        SecureFlight.push(secure_fl_data);

        if (item.passport_number) {
          const issuing_country: {
            id: number;
            name: string;
            iso: string;
            iso3: string;
          }[] = await this.Model.CommonModel().getCountry({
            id: Number(item.issuing_country),
          });
          let nationality: {
            id: number;
            name: string;
            iso: string;
            iso3: string;
          }[] = issuing_country;
          if (item.nationality !== item.issuing_country) {
            nationality = await this.Model.CommonModel().getCountry({
              id: Number(item.nationality),
            });
          }

          AdvancePassenger.push({
            Document: {
              IssueCountry: issuing_country[0].iso3,
              NationalityCountry: nationality[0].iso3,
              ExpirationDate: String(item.passport_expiry_date)?.split('T')[0],
              Number: item.passport_number,
              Type: 'P',
            },
            PersonName: {
              Gender:
                item.type === 'INF' && item.gender === 'Male'
                  ? 'MI'
                  : item.type === 'INF' && item.gender === 'Female'
                    ? 'FI'
                    : item.gender[0],
              GivenName: item.first_name,
              Surname: item.last_name,
              DateOfBirth: String(item.date_of_birth)?.split('T')[0],
              NameNumber: item.type === 'INF' ? inf_ind + '.1' : name_number,
            },
            SegmentNumber: 'A',
          });
        }

        const person = {
          NameNumber: name_number,
          NameReference:
            item.type === 'INF'
              ? 'I' + monthDiff(item.date_of_birth)
              : item.type === 'ADT'
                ? ''
                : item.type,
          GivenName: item.first_name + ' ' + item.reference,
          Surname: item.last_name,
          PassengerType: item.type,
          Infant: item.type === 'INF' ? true : false,
        };

        if (item.type === 'INF') {
          inf_ind++;
        }
        return person;
      })
    );

    const flight = foundItem;

    let passenger_qty = 0;

    const PassengerType = flight.passengers.map((passenger: any) => {
      passenger_qty = passenger.number;

      return {
        Code: passenger.type,
        Quantity: String(passenger_qty),
      };
    });

    // flight segments
    const FlightSegment = [];
    const booking_code =
      flight.availability?.flatMap((avElem) =>
        avElem?.segments?.map(
          (segElem) => segElem?.passenger?.[0]?.booking_code
        )
      ) || [];
    let booking_code_index = 0;

    for (const item of flight.flights) {
      for (const option of item.options) {
        const mar_code = option.carrier.carrier_marketing_code;

        const segment = {
          ArrivalDateTime: this.flightUtils.convertDateTime(
            option.arrival.date,
            option.arrival.time
          ),
          DepartureDateTime: this.flightUtils.convertDateTime(
            option.departure.date,
            option.departure.time
          ),

          FlightNumber: String(option.carrier.carrier_marketing_flight_number),
          NumberInParty: String(passengerLength),
          ResBookDesigCode: booking_code?.[booking_code_index],
          Status: 'NN',
          DestinationLocation: {
            LocationCode: option.arrival.airport_code,
          },
          MarketingAirline: {
            Code: mar_code,
            FlightNumber: String(
              option.carrier.carrier_marketing_flight_number
            ),
          },
          OriginLocation: {
            LocationCode: option.departure.airport_code,
          },
        };
        FlightSegment.push(segment);
        booking_code_index++;
      }
    }

    const request_body = {
      CreatePassengerNameRecordRQ: {
        version: '2.5.0',
        targetCity: config.SABRE_USERNAME.split('-')[1],
        haltOnAirPriceError: true,
        TravelItineraryAddInfo: {
          AgencyInfo: {
            Address: {
              AddressLine: 'OTA',
              CityName: 'DHAKA BANGLADESH',
              CountryCode: 'BD',
              PostalCode: '1213',
              StateCountyProv: {
                StateCode: 'BD',
              },
              StreetNmbr: 'DHAKA',
            },
            Ticketing: {
              TicketType: '7TAW',
            },
          },
          CustomerInfo: {
            ContactNumbers: {
              ContactNumber,
            },
            Email,
            PersonName,
          },
        },
        AirBook: {
          HaltOnStatus: [
            {
              Code: 'HL',
            },
            {
              Code: 'KK',
            },
            {
              Code: 'LL',
            },
            {
              Code: 'NN',
            },
            {
              Code: 'NO',
            },
            {
              Code: 'UC',
            },
            {
              Code: 'US',
            },
          ],
          OriginDestinationInformation: {
            FlightSegment,
          },
          RedisplayReservation: {
            NumAttempts: 5,
            WaitInterval: 1000,
          },
        },
        AirPrice: [
          {
            PriceRequestInformation: {
              Retain: true,
              OptionalQualifiers: {
                FOP_Qualifiers: {
                  BasicFOP: {
                    Type: 'CASH',
                  },
                },
                PricingQualifiers: {
                  PassengerType,
                },
              },
            },
          },
        ],
        SpecialReqDetails: {
          SpecialService: {
            SpecialServiceInfo: {
              AdvancePassenger,
              SecureFlight,
              Service,
            },
          },
        },
        PostProcessing: {
          EndTransaction: {
            Source: {
              ReceivedFrom: 'WEB',
            },
            Email: {
              Ind: true,
            },
          },
          RedisplayReservation: {
            waitInterval: 1000,
          },
        },
      },
    };

    return request_body;
  }

  //flight booking service
  public async FlightBookingService({
    body,
    user_info,
    revalidate_data,
  }: {
    body: IFlightBookingRequestBody;
    user_info: {
      id: number;
      email: string;
      name: string;
      phone: string;
      agency_id?: number;
    };
    revalidate_data: IFormattedFlightItinerary;
  }) {
    const requestBody = await this.pnrReqBody(body, revalidate_data, {
      email: user_info.email,
      phone: user_info.phone,
      name: user_info.name,
    });
    const response = await this.request.postRequest(
      SabreAPIEndpoints.FLIGHT_BOOKING_ENDPOINT,
      requestBody
    );
    if (!response) {
      throw new CustomError('Something went wrong. Please try again later', 500);
    }
    if (
      response?.CreatePassengerNameRecordRS?.ApplicationResults?.status !==
      'Complete'
    ) {
      // await this.Model.errorLogsModel(trx).insert({
      //   level: ERROR_LEVEL_WARNING,
      //   message: 'Error from sabre while booking flight',
      //   url: SabreAPIEndpoints.FLIGHT_BOOKING_ENDPOINT,
      //   http_method: 'POST',
      //   metadata: {
      //     api: SABRE_API,
      //     endpoint: SabreAPIEndpoints.FLIGHT_BOOKING_ENDPOINT,
      //     payload: requestBody,
      //     response: response?.CreatePassengerNameRecordRS?.ApplicationResults,
      //   },
      // });
      throw new CustomError(
        'This flight is already booked. Please try booking another flight',
        this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        ERROR_LEVEL_WARNING,
        {
          api: SABRE_API,
          endpoint: SabreAPIEndpoints.FLIGHT_BOOKING_ENDPOINT,
          payload: requestBody,
          response: response?.CreatePassengerNameRecordRS?.ApplicationResults
        }
      )
      // return {
      //   success: false,
      //   code: this.StatusCode.HTTP_BAD_REQUEST,
      //   message: this.ResMsg.HTTP_BAD_REQUEST,
      //   error: response.CreatePassengerNameRecordRS.ApplicationResults,
      // };
    }

    //return GDS PNR
    return response?.CreatePassengerNameRecordRS?.ItineraryRef?.ID as string;
  }

  ///==================FLIGHT BOOKING (END)=========================///

  ////////==================TICKET ISSUE (START)=========================//////////
  // // ticket issue req formatter
  private SabreTicketIssueReqFormatter(pnrId: string, unique_traveler: number) {
    let Record: any[] = [];
    for (let i = 1; i <= unique_traveler; i++) {
      Record.push({
        Number: i,
      });
    }
    return {
      AirTicketRQ: {
        version: '1.3.0',
        targetCity: config.SABRE_USERNAME.split('-')[1],
        DesignatePrinter: {
          Printers: {
            Ticket: {
              CountryCode: 'BD',
            },
            Hardcopy: {
              LNIATA: config.SABRE_LNIATA_CODE,
            },
            InvoiceItinerary: {
              LNIATA: config.SABRE_LNIATA_CODE,
            },
          },
        },
        Itinerary: {
          ID: pnrId,
        },
        Ticketing: [
          {
            MiscQualifiers: {
              Commission: {
                Percent: 7,
              },
            },
            PricingQualifiers: {
              PriceQuote: [
                {
                  Record,
                },
              ],
            },
          },
        ],
        PostProcessing: {
          EndTransaction: {
            Source: {
              ReceivedFrom: 'SABRE WEB',
            },
            Email: {
              eTicket: {
                PDF: {
                  Ind: true,
                },
                Ind: true,
              },
              PersonName: {
                NameNumber: '1.1',
              },
              Ind: true,
            },
          },
        },
      },
    };
  }

  //ticket issue service
  public async TicketIssueService({
    pnr,
    unique_traveler,
  }: {
    pnr: string;
    unique_traveler: number;
  }) {
    const ticketReqBody = this.SabreTicketIssueReqFormatter(
      pnr,
      unique_traveler
    );
    const response = await this.request.postRequest(
      SabreAPIEndpoints.TICKET_ISSUE_ENDPOINT,
      ticketReqBody
    );

    if (response?.AirTicketRS?.ApplicationResults?.status === 'Complete') {
      const retrieve_booking = await this.request.postRequest(
        SabreAPIEndpoints.GET_BOOKING_ENDPOINT,
        {
          confirmationId: pnr,
        }
      );

      if (!retrieve_booking || !retrieve_booking?.flightTickets) {
        await this.Model.ErrorLogsModel().insertErrorLogs({
          level: ERROR_LEVEL_WARNING,
          message: 'Error from sabre while ticket issue',
          url: SabreAPIEndpoints.GET_BOOKING_ENDPOINT,
          http_method: 'POST',
          metadata: {
            api: SABRE_API,
            endpoint: SabreAPIEndpoints.GET_BOOKING_ENDPOINT,
            payload: { confirmationId: pnr },
            response: retrieve_booking,
          },
        });
        // return {
        //   success: true,
        //   code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        //   message: 'An error occurred while retrieving the ticket numbers',
        //   error: retrieve_booking?.errors,
        // };
      }

      const ticket_number = [];
      for (let i = 0; i < retrieve_booking.flightTickets.length; i++) {
        ticket_number.push(retrieve_booking.flightTickets[i].number);
      }
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Ticket has been issued',
        data: ticket_number,
      };
    } else {
      await this.Model.ErrorLogsModel().insertErrorLogs({
        level: ERROR_LEVEL_WARNING,
        message: 'Error from sabre while ticket issue',
        url: SabreAPIEndpoints.TICKET_ISSUE_ENDPOINT,
        http_method: 'POST',
        metadata: {
          api: SABRE_API,
          endpoint: SabreAPIEndpoints.TICKET_ISSUE_ENDPOINT,
          payload: ticketReqBody,
          response: response,
        }
      });
      // return {
      //   success: false,
      //   code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
      //   message: 'An error occurred while issuing the ticket',
      //   error: response?.errors,
      // };
    }
  }

  ///==================TICKET ISSUE (END)=========================///

  /////////==================BOOKING CANCEL (START)=========================//////////
  //sabre booking cancel req formatter
  private SabreBookingCancelReqFormatter(pnr: string) {
    return {
      confirmationId: pnr,
      retrieveBooking: true,
      cancelAll: true,
      errorHandlingPolicy: 'ALLOW_PARTIAL_CANCEL',
    };
  }

  //sabre booking cancel service
  public async SabreBookingCancelService({
    pnr
  }: {
    pnr: string;
  }) {
    //cancel booking req formatter
    const cancelBookingBody = this.SabreBookingCancelReqFormatter(pnr);
    const response = await this.request.postRequest(
      SabreAPIEndpoints.CANCEL_BOOKING_ENDPOINT,
      cancelBookingBody
    );
    //if there is error then return
    if (!response || response.errors) {
      // await this.Model.errorLogsModel(trx).insert({
      //   level: ERROR_LEVEL_WARNING,
      //   message: 'Error from sabre while cancel booking',
      //   url: SabreAPIEndpoints.CANCEL_BOOKING_ENDPOINT,
      //   http_method: 'POST',
      //   metadata: {
      //     api: SABRE_API,
      //     endpoint: SabreAPIEndpoints.CANCEL_BOOKING_ENDPOINT,
      //     payload: cancelBookingBody,
      //     response: response,
      //   },
      //   source,
      // });
      throw new CustomError(
        'An error occurred while cancelling the booking',
        this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        ERROR_LEVEL_WARNING,
        {
          api: SABRE_API,
          endpoint: SabreAPIEndpoints.CANCEL_BOOKING_ENDPOINT,
          payload: cancelBookingBody,
          response: response,
        }
      );
      // return {
      //   success: false,
      //   code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
      //   message: 'An error occurred while cancelling the booking',
      //   error: response?.errors,
      // };
    }

    return {
      success: true,
    };
  }

  ///==================BOOKING CANCEL (END)=========================///

  /////==================GET BOOKING(START)=========================//////////////
  public async GRNUpdate({
    pnr,
    booking_status,
  }: {
    pnr: string;
    booking_status?: string;
  }) {
    const response = await this.request.postRequest(
      SabreAPIEndpoints.GET_BOOKING_ENDPOINT,
      {
        confirmationId: pnr,
      }
    );

    let status = booking_status;
    let ticket_number = [];
    let last_time = null;
    let airline_pnr = null;
    let refundable = false;

    if (response) {
      //pnr status
      if (
        response?.flightTickets?.[0]?.ticketStatusName?.toLowerCase() ===
        FLIGHT_BOOKING_VOID
      ) {
        status = FLIGHT_BOOKING_VOID;
      } else if (
        response?.flightTickets?.[0]?.ticketStatusName?.toLowerCase() ===
        FLIGHT_BOOKING_REFUNDED
      ) {
        status = FLIGHT_BOOKING_REFUNDED;
      } else if (response?.isTicketed) {
        status = FLIGHT_TICKET_ISSUE;
        //get ticket number
        for (let i = 0; i < response?.flightTickets?.length; i++) {
          ticket_number.push(response?.flightTickets[i].number as string);
        }
      } else {
        if (
          response?.bookingId &&
          response?.startDate === undefined &&
          response?.endDate === undefined
        ) {
          status = FLIGHT_BOOKING_CANCELLED;
        }
      }
      //get last time of ticket issue
      response?.specialServices?.map((elem: any) => {
        if (elem.code === 'ADTK') {
          last_time = elem.message;
        }
      });

      //get airline pnr
      airline_pnr =
        [
          ...new Set(
            response?.flights
              ?.map((flight: { confirmationId: any }) => flight?.confirmationId)
              .filter((id: any) => id)
          ),
        ].join(', ') || '';

      //get refundable status
      refundable = response?.fareRules?.[0]?.isRefundable;
    }

    return {
      success: response ? true : false,
      status,
      ticket_number,
      last_time,
      airline_pnr,
      refundable,
    };
  }
  /////==================GET BOOKING(END)=========================//////////////

}
