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

    public cancelBooking = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamNumValidator()
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.cancelBooking(req);
            res.status(code).json(rest);
        }
    );

    public issueTicket = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamNumValidator()
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.issueTicket(req);
            res.status(code).json(rest);
        }
    );

    public updateBooking = this.asyncWrapper.wrap(
        {
            bodySchema: this.validator.updateFlightBookingSchema,
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.updateBooking(req);
            res.status(code).json(rest);
        }
    );

    public updatePendingBookingManually = this.asyncWrapper.wrap(
        {
            bodySchema: this.validator.updatePendingBookingManuallySchema,
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.updatePendingBookingManually(req);
            res.status(code).json(rest);
        }
    );

    public updateProcessingTicketManually = this.asyncWrapper.wrap(
        {
            bodySchema: this.validator.updateProcessingTicketSchema,
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.updateProcessingTicketManually(req);
            res.status(code).json(rest);
        }
    );
}