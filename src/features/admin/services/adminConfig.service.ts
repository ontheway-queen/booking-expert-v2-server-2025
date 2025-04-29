import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";
import { ICheckSlug } from "../utils/types/adminConfig.types";
import { SLUG_TYPE_HOLIDAY } from "../../../utils/miscellaneous/constants";
import { HOLIDAY_CREATED_BY_ADMIN } from "../../../utils/miscellaneous/holidayConstants";
export class AdminConfigService extends AbstractServices {

    public async checkSlug(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { slug, type } = req.query as unknown as ICheckSlug;

            if (type === SLUG_TYPE_HOLIDAY) {
                const holidayModel = this.Model.HolidayPackageModel(trx);
                const check_slug = await holidayModel.getHolidayPackageList({
                    slug,
                    created_by: HOLIDAY_CREATED_BY_ADMIN
                });
                if (check_slug.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.SLUG_ALREADY_EXISTS
                    }
                }
            } else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                }
            }

            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.AVAILABLE_SLUG
            }
        });
    }
}