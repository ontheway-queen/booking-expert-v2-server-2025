import {
  SABRE_CABIN_CODE,
  SABRE_MEAL_CODE,
} from '../../miscellaneous/staticData';
import { IFormattedFlight, IFormattedFlightOption } from '../../supportTypes/flightTypes/commonFlightTypes';
import { IFormattedLegDesc, OriginDestinationInformation } from '../../supportTypes/flightTypes/sabreFlightTypes';

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
      throw new Error("Invalid date format");
    }

    // Extract HH:mm:ss from time string
    const match = timeStr.match(/^(\d{2}):(\d{2}):(\d{2})/);
    if (!match) {
      throw new Error("Invalid time format");
    }

    const [_, hours, minutes, seconds] = match.map(Number);

    // Set time in UTC
    date.setUTCHours(hours, minutes, seconds, 0);

    // Format output: YYYY-MM-DDTHH:mm:ss
    return date.toISOString().slice(0, 19);
  };

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
}
