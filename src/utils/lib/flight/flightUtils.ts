import {
  SABRE_CABIN_CODE,
  SABRE_MEAL_CODE,
} from '../../miscellaneous/staticData';

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
}
