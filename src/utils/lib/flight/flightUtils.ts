import { cabinCode, mealData } from '../../miscellaneous/staticData';

export default class FlightUtils {
  // get meal by code
  public getMeal(code: string) {
    return mealData.find((item) => item.code === code);
  }

  // get cabin by code
  public getCabin(code: string) {
    return cabinCode.find((item) => item.code === code);
  }
}
