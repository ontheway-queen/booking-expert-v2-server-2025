export type HolidayPackageServiceType = "INCLUDE" | "EXCLUDE";

export interface IInsertHolidayPackageServicePayload {
  holiday_package_id: number;
  type: HolidayPackageServiceType;
  title: string;
}

export interface IGetHolidayPackageService {
  id: number;
  holiday_package_id: number;
  type: HolidayPackageServiceType;
  title: string;
  created_at: Date;
}

export interface IUpdateHolidayPackageServicePayload {
  type?: HolidayPackageServiceType;
  title?: string;
}
