export interface IInsertHolidayPackageImagePayload {
    holiday_package_id: number;
    image: string;
  }
  
  export interface IGetHolidayPackageImage {
    id: number;
    holiday_package_id: number;
    image: string;
    created_at: Date;
  }
  
  export interface IUpdateHolidayPackageImagePayload {
    image?: string;
  }
  