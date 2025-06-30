import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AgentB2CHolidayService } from '../services/agentB2CHoliday.service';
import { AgentB2CHolidayValidator } from '../utils/validators/agentB2CHoliday.validator';

export class AgentB2CHolidayController extends AbstractController {
  private service = new AgentB2CHolidayService();
  private validator = new AgentB2CHolidayValidator();
  constructor() {
    super();
  }

  public searchHolidayPackage = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.holidayPackageSearchFilterQuerySchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.searchHolidayPackage(req);
      res.status(code).json(rest);
    }
  );

  public getSingleHolidayPackage = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamStringValidator('slug'),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleHolidayPackage(req);
      res.status(code).json(rest);
    }
  );

  public bookHolidayPackage = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.holidayPackageCreateBookingSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.bookHolidayPackage(req);
      res.status(code).json(rest);
    }
  );

  public getHolidayPackageBookingList = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.holidayPackageBookingListFilterQuery,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getHolidayPackageBookingList(
        req
      );
      res.status(code).json(rest);
    }
  );

  public getSingleHolidayPackageBooking = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } =
        await this.service.getSingleHolidayPackageBooking(req);
      res.status(code).json(rest);
    }
  );

  public cancelHolidayPackageBooking = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.cancelHolidayPackageBooking(
        req
      );
      res.status(code).json(rest);
    }
  );
}
