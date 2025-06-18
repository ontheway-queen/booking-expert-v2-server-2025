import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AdminAgentHolidayService } from '../../services/adminAgentServices/adminAgentHoliday.service';
import { AdminAgentHolidayValidator } from '../../utils/validators/adminAgentValidators/adminAgentHoliday.validator';

export class AdminAgentHolidayController extends AbstractController {
  private service = new AdminAgentHolidayService();
  private validator = new AdminAgentHolidayValidator();
  constructor() {
    super();
  }

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

  public updateHolidayPackageBooking = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamNumValidator(),
      bodySchema: this.validator.holidayPackageUpdateSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.updateHolidayPackageBooking(
        req
      );
      res.status(code).json(rest);
    }
  );
}
