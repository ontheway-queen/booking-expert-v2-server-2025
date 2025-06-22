import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AgentFlightService } from '../services/agentFlight.service';
import AgentFlightValidator from '../utils/validators/agentFlight.validator';

export default class AgentFlightController extends AbstractController {
  private service = new AgentFlightService();
  private validator = new AgentFlightValidator();
  constructor() {
    super();
  }

  public flightSearch = this.asyncWrapper.wrap(
    { bodySchema: this.validator.flightSearchSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.flightSearch(req);
      res.status(code).json(rest);
    }
  );

  public FlightSearchSSE = this.asyncWrapper.wrap(
    { querySchema: this.validator.flightSearchSSESchema },
    async (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Function to send SSE events
      const sendEvent = (event: string, data: any) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      try {
        sendEvent('start', { message: 'Flight search has been started.' });
        // Pass `sendEvent` to the service
        await this.service.flightSearchSSE(req, res);

        //SSE connection closed
        sendEvent('end', { message: 'Flight search completed successfully.' });
        res.end();
      } catch (error) {
        sendEvent('error', {
          message: 'An error occurred during flight search.',
          error,
        });
        res.end();
      }
    }
  );

  public getFlightFareRule = this.asyncWrapper.wrap(
    { querySchema: this.validator.flightRevalidateSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getFlightFareRule(req);
      res.status(code).json(rest);
    }
  );

  public flightRevalidate = this.asyncWrapper.wrap(
    { querySchema: this.validator.flightRevalidateSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.flightRevalidate(req);
      res.status(code).json(rest);
    }
  );

  public flightBooking = this.asyncWrapper.wrap(
    { bodySchema: this.validator.flightBookingSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.flightBooking(req);
      res.status(code).json(rest);
    }
  );

  public getAllBookingList = this.asyncWrapper.wrap(
    { bodySchema: this.validator.getFlightListSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getAllBookingList(req);
      res.status(code).json(rest);
    }
  );

  public getSingleBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleBooking(req);
      res.status(code).json(rest);
    }
  );

  public issueTicket = this.asyncWrapper.wrap(
    { bodySchema: this.validator.issueTicketSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.issueTicket(req);
      res.status(code).json(rest);
    }
  );

  public cancelBooking = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamNumValidator() },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.cancelBooking(req);
      res.status(code).json(rest);
    }
  );
}
