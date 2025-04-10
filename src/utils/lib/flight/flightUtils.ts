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
}
