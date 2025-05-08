import { Request, Response } from 'express';
import AbstractController from "../../../abstract/abstract.controller";
import { B2CHolidayService } from '../services/b2cHoliday.service';
import { B2CHolidayValidator } from '../utils/validators/b2cHoliday.validator';

export class B2CHolidayController extends AbstractController {
    private service = new B2CHolidayService();
    private validator = new B2CHolidayValidator();
    constructor() {
        super();
    }

    public searchHolidayPackage = this.asyncWrapper.wrap(
        {
            querySchema: this.validator.holidayPackageSearchFilterQuerySchema
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.searchHolidayPackage(req);
            res.status(code).json(rest);
        }
    );

    public getSingleHolidayPackage = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamStringValidator("slug")
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.getSingleHolidayPackage(req);
            res.status(code).json(rest);
        }
    );

    public bookHolidayPackage = this.asyncWrapper.wrap(
        {
            bodySchema: this.validator.holidayPackageCreateBookingSchema
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.bookHolidayPackage(req);
            res.status(code).json(rest);
        }
    );

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

    public cancelHolidayPackageBooking = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamNumValidator()
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.cancelHolidayPackageBooking(req);
            res.status(code).json(rest);
        }
    );
}