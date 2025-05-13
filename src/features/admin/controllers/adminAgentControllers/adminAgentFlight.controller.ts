import { Request, Response } from 'express';
import AbstractController from '../../../../abstract/abstract.controller';
import { AdminAgentFlightService } from '../../services/adminAgentServices/adminAgentFlight.service';
import { AdminAgentFlightValidator } from '../../utils/validators/adminAgentValidators/adminAgentFlight.validator';

export class AdminAgentFlightController extends AbstractController {
    private service = new AdminAgentFlightService();
    private validator = new AdminAgentFlightValidator();
    constructor() {
        super();
    }

    public getAllFlightBooking = this.asyncWrapper.wrap(
        {
            querySchema: this.validator.getFlightListSchema
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.getAllFlightBooking(req);
            res.status(code).json(rest);
        }
    );

    public getSingleBooking = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamNumValidator()
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.getSingleBooking(req);
            res.status(code).json(rest);
        }
    );

    public getBookingTrackingData = this.asyncWrapper.wrap(
        {
            querySchema: this.validator.getBookingTrackingDataSchema,
            paramSchema: this.commonValidator.singleParamNumValidator()
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.getBookingTrackingData(req);
            res.status(code).json(rest);
        }
    );
}