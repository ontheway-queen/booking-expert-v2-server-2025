import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminHolidayService } from '../services/adminHoliday.service';
import { AdminHolidayValidator } from '../utils/validators/adminHoliday.validator';

export default class AdminHolidayController extends AbstractController {
    private validator = new AdminHolidayValidator();
    private service = new AdminHolidayService();
    constructor() {
        super();
    }

    public createHoliday = this.asyncWrapper.wrap(
        { bodySchema: this.validator.createHolidaySchema },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.createHoliday(req);
            res.status(code).json(data);
        }
    );

    public getHolidayPackageList = this.asyncWrapper.wrap(
        { querySchema: this.validator.getHolidayPackageListSchema },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.getHolidayPackageList(req);
            res.status(code).json(data);
        }
    );

    public getSingleHolidayPackage = this.asyncWrapper.wrap(
        { paramSchema: this.commonValidator.singleParamNumValidator("id") },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.getSingleHolidayPackage(req);
            res.status(code).json(data);
        }
    );

    public updateHolidayPackage = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamNumValidator("id"),
            bodySchema: this.validator.updateHolidaySchema
        },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.updateHolidayPackage(req);
            res.status(code).json(data);
        }
    );

    public deleteHolidayPackage = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamNumValidator("id")
        },
        async (req: Request, res: Response) => {
            const { code, ...data } = await this.service.deleteHolidayPackage(req);
            res.status(code).json(data);
        }
    );

}
