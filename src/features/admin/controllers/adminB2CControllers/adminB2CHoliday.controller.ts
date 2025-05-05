import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AdminB2CHolidayService } from '../../services/adminB2CServices/adminB2CHoliday.service';
import { AdminB2CHolidayValidator } from '../../utils/validators/adminB2CValidators/adminB2CHoliday.validator';

export class AdminB2CHolidayController extends AbstractController {
    private service = new AdminB2CHolidayService();
    private validator = new AdminB2CHolidayValidator();
    constructor() {
        super();
    }

    public getHolidayPackageBookingList = this.asyncWrapper.wrap(
        {
            querySchema: this.validator.holidayPackageBookingListFilterQuery
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.getHolidayPackageBookingList(req);
            res.status(code).json(rest);
        }
    );

    public getSingleHolidayPackageBooking = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamNumValidator()
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.getSingleHolidayPackageBooking(req);
            res.status(code).json(rest);
        }
    );

    public updateHolidayPackageBooking = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamNumValidator(),
            bodySchema: this.validator.holidayPackageUpdateSchema
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.updateHolidayPackageBooking(req);
            res.status(code).json(rest);
        }
    );
}