import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { B2CFlightService } from '../services/b2cFlight.service';
import B2CFlightValidator from '../utils/validators/b2cFlight.validator';

export class B2CFlightController extends AbstractController {
  private service = new B2CFlightService();
  private validator = new B2CFlightValidator();
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

  public getFareRules = this.asyncWrapper.wrap(
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
}
