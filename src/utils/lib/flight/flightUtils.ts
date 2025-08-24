import {
  JOURNEY_TYPE_MULTI_CITY,
  JOURNEY_TYPE_ONE_WAY,
  JOURNEY_TYPE_ROUND_TRIP,
  ROUTE_TYPE,
} from '../../miscellaneous/flightConstant';
import {
  BD_AIRPORT,
  SABRE_CABIN_CODE,
  SABRE_MEAL_CODE,
} from '../../miscellaneous/staticData';
import {
  IFormattedFlight,
  IFormattedFlightOption,
  IFlightAvailability,
  IOriginDestinationInformationPayload,
} from '../../supportTypes/flightTypes/commonFlightTypes';
import {
  IFormattedLegDesc,
  OriginDestinationInformation,
} from '../../supportTypes/flightTypes/sabreFlightTypes';

export default class FlightUtils {
  // get meal by code
  public getMeal(code: string) {
    return SABRE_MEAL_CODE.find((item) => item.code === code);
  }

  // get cabin by code
  public getCabin(code: string) {
    return SABRE_CABIN_CODE.find((item) => item.code === code);
  }

  //convert data time
  public convertDateTime(dateStr: string | Date, timeStr: string) {
    const date = new Date(dateStr);

    // Validate date
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    // Extract HH:mm:ss from time string
    const match = timeStr.match(/^(\d{2}):(\d{2}):(\d{2})/);
    if (!match) {
      throw new Error('Invalid time format');
    }

    const [_, hours, minutes, seconds] = match.map(Number);

    // Set time in UTC
    date.setUTCHours(hours, minutes, seconds, 0);

    // Format output: YYYY-MM-DDTHH:mm:ss
    return date.toISOString().slice(0, 19);
  }

  // Get legs desc
  public getLegsDesc(
    legItems: {
      ref: number;
    }[],
    legDesc: IFormattedLegDesc[],
    OriginDest: OriginDestinationInformation[]
  ) {
    const legsDesc: IFormattedFlight[] = [];
    for (const [index, leg_item] of legItems.entries()) {
      const leg_id = leg_item.ref;

      const legs = legDesc.find(
        (legDecs: IFormattedLegDesc) => legDecs.id === leg_id
      );

      if (legs) {
        const options: IFormattedFlightOption[] = [];

        const date = OriginDest[index].DepartureDateTime;

        for (const option of legs.options) {
          const { departureDateAdjustment, ...rest } = option;
          let departure_date = new Date(date);
          if (departureDateAdjustment) {
            departure_date.setDate(
              departure_date.getDate() + Number(departureDateAdjustment)
            );
          }

          let year = departure_date.getFullYear();
          let month = String(departure_date.getMonth() + 1).padStart(2, '0');
          let day = String(departure_date.getDate()).padStart(2, '0');

          const departureDate = `${year}-${month}-${day}`;

          const arrivalDate = new Date(departureDate);

          if (option.arrival.date_adjustment) {
            arrivalDate.setDate(
              arrivalDate.getDate() + option.arrival.date_adjustment
            );
          }

          const arrivalYear = arrivalDate.getFullYear();
          const arrivalMonth = String(arrivalDate.getMonth() + 1).padStart(
            2,
            '0'
          );
          const arrivalDay = String(arrivalDate.getDate()).padStart(2, '0');

          const formattedArrivalDate = `${arrivalYear}-${arrivalMonth}-${arrivalDay}`;

          options.push({
            ...rest,
            departure: {
              ...option.departure,
              date: departureDate,
            },
            arrival: {
              ...option.arrival,
              date: formattedArrivalDate,
            },
          });
        }

        const layoverTime = this.getLayoverTime(options as any);

        legsDesc.push({
          id: legs.id,
          stoppage: options.length - 1,
          elapsed_time: legs.elapsed_time,
          layover_time: layoverTime,
          options,
        });
      }
    }
    return legsDesc;
  }

  // Get layover time
  private getLayoverTime = (options: any[]) => {
    const layoverTime = options.map((item, index) => {
      let firstArrival = options[index].arrival.time;
      let secondDeparture = options[index + 1]?.departure?.time;

      let layoverTimeString = 0;

      if (secondDeparture) {
        const startDate = new Date(`2020-01-01T${firstArrival}`);

        let endDate = new Date(`2020-01-01T${secondDeparture}`);

        if (endDate < startDate) {
          endDate = new Date(`2020-01-02T${secondDeparture}`);
          // Calculate the difference in milliseconds
          const differenceInMilliseconds =
            endDate.getTime() - startDate.getTime();

          // Convert the difference minutes
          layoverTimeString = Math.abs(differenceInMilliseconds / (1000 * 60));
        } else {
          const layoverTimeInMilliseconds =
            endDate.getTime() - startDate.getTime();

          layoverTimeString = Math.abs(layoverTimeInMilliseconds) / (1000 * 60);
        }
      }

      return layoverTimeString;
    });
    return layoverTime;
  };

  //get route of flight
  public getRouteOfFlight(
    leg_description: { departureLocation: string; arrivalLocation: string }[]
  ) {
    let route;
    route = leg_description.map((item: any) => {
      return item.departureLocation;
    });
    route =
      route.join('-') +
      '-' +
      leg_description[leg_description.length - 1].arrivalLocation;
    return route;
  }

  //get journey type
  public getJourneyType(journey_type: '1' | '2' | '3') {
    if (journey_type === '1') {
      return JOURNEY_TYPE_ONE_WAY;
    } else if (journey_type === '2') {
      return JOURNEY_TYPE_ROUND_TRIP;
    } else {
      return JOURNEY_TYPE_MULTI_CITY;
    }
  }

  //map flight availability
  public mapFlightAvailability(availability: IFlightAvailability[]) {
    const baggage_info: string[] = [];
    const cabin_info: string[] = [];
    availability.map((item) => {
      item.segments.map((segment) => {
        baggage_info.push(
          `${segment.passenger[0].baggage_count} ${segment.passenger[0].baggage_unit}`
        );
        cabin_info.push(
          `${segment.passenger[0].cabin_type} ${segment.passenger[0].booking_code}`
        );
      });
    });

    return {
      baggage_info,
      cabin_info,
    };
  }

  //segment place info
  public segmentPlaceInfo(airport: string, city: string, city_code: string) {
    return `${airport} (${city},${city_code})`;
  }

  //flight duration
  public getDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? hours + ' hour' + (hours > 1 ? 's' : '') : ''} ${
      mins > 0 ? mins + ' minute' + (mins > 1 ? 's' : '') : ''
    }`.trim();
  }

  // find route type
  public routeTypeFinder({
    airportsPayload,
    originDest,
  }: {
    originDest?: IOriginDestinationInformationPayload[];
    airportsPayload?: string[];
  }) {
    let route_type: 'SOTO' | 'FROM_DAC' | 'TO_DAC' | 'DOMESTIC' =
      ROUTE_TYPE.SOTO;

    let airports: string[] = [];

    if (originDest) {
      originDest.forEach((item) => {
        airports.push(item.OriginLocation.LocationCode);
        airports.push(item.DestinationLocation.LocationCode);
      });
    } else if (airportsPayload) {
      airports = airportsPayload;
    }

    if (airports.every((airport) => BD_AIRPORT.includes(airport))) {
      route_type = ROUTE_TYPE.DOMESTIC;
    } else if (BD_AIRPORT.includes(airports[0])) {
      route_type = ROUTE_TYPE.FROM_DAC;
    } else if (airports.some((code) => BD_AIRPORT.includes(code))) {
      route_type = ROUTE_TYPE.TO_DAC;
    } else {
      route_type = ROUTE_TYPE.SOTO;
    }

    return route_type;
  }

  public getClassFromId(cabin: string) {
    if (cabin === '1') {
      return 'ECONOMY';
    } else if (cabin === '2') {
      return 'PREMIUM';
    } else if (cabin === '3') {
      return 'BUSINESS';
    } else {
      return 'FIRST';
    }
  }

  //get cabin code for sabre revalidate
  public getClassCodeFromId(cabin: '1' | '2' | '3' | '4') {
    if (cabin === '1') {
      //economy
      return 'Y';
    } else if (cabin === '2') {
      //premium economy
      return 'W';
    } else if (cabin === '3') {
      //business
      return 'J';
    } else {
      //first
      return 'F';
    }
  }

  public utcToLocalDateTime(DateTime: string): [string, string] {
    const TimeLimits = new Date(DateTime);
    if (!Number.isNaN(TimeLimits.getTime())) {
      const year = TimeLimits.getFullYear();
      const month = String(TimeLimits.getMonth() + 1).padStart(2, '0');
      const day = String(TimeLimits.getDate()).padStart(2, '0');
      const hours = String(TimeLimits.getHours()).padStart(2, '0');
      const minutes = String(TimeLimits.getMinutes()).padStart(2, '0');
      return [`${year}-${month}-${day}`, `${hours}:${minutes}`];
    } else {
      return ['', ''];
    }
  }
}
