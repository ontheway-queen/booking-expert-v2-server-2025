import AbstractServices from "../../../../abstract/abstract.service";
import {Request} from 'express';
import { SOURCE_AGENT } from "../../../../utils/miscellaneous/constants";
import CustomError from "../../../../utils/lib/customError";

export class AdminAgentHolidayService extends AbstractServices {

    public async getHolidayPackageBookingList(req: Request) {
        return await this.db.transaction(async (trx) => {
            const holidayPackageBookingModel = this.Model.HolidayPackageBookingModel(trx);
            const query = req.query;
            const getBookingList = await holidayPackageBookingModel.getHolidayBookingList({
                booked_by: SOURCE_AGENT,
                ...query
            });

            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: getBookingList.total,
                data: getBookingList.data
            };
        });
    }

    public async getSingleHolidayPackageBooking(req: Request) {
        return await this.db.transaction(async (trx) => {
            const holidayPackageBookingModel = this.Model.HolidayPackageBookingModel(trx);
            const { id } = req.params as unknown as { id: number };

            const get_booking = await holidayPackageBookingModel.getSingleHolidayBooking({
                id,
                booked_by: SOURCE_AGENT
            });

            if (!get_booking) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                };
            } else {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: get_booking
                };
            };
        });
    }

    public async updateHolidayPackageBooking(req: Request) {
        return await this.db.transaction(async (trx) => {
            const {user_id} = req.admin;
            const holidayPackageBookingModel = this.Model.HolidayPackageBookingModel(trx);
            const { id } = req.params as unknown as { id: number };

            const get_booking = await holidayPackageBookingModel.getSingleHolidayBooking({
                id,
                booked_by: SOURCE_AGENT
            });

            if (!get_booking) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                };
            }

            const update_res = await holidayPackageBookingModel.updateHolidayBooking({ status: req.body.status, updated_by: user_id, updated_at: new Date() }, id);

            if(update_res){
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Booking has been updated successfully"
                };
            } else{
                throw new CustomError("Something went wrong while updating the holiday package booking", this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
            };
        });
    }
}