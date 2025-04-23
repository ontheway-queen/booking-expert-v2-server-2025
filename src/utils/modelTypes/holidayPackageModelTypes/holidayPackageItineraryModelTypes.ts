export interface IInsertHolidayPackageItineraryPayload {
    holiday_package_id: number;
    day_number: number;
    title: string;
    details?: string;
  }
  
  export interface IGetHolidayPackageItinerary {
    id: number;
    holiday_package_id: number;
    day_number: number;
    title: string;
    details: string | null;
    created_at: Date;
  }
  
  export interface IUpdateHolidayPackageItineraryPayload {
    day_number?: number;
    title?: string;
    details?: string;
  }
  