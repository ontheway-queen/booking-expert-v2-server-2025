import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import AgentB2CHotelService from '../services/agentB2CHotel.service';
import { AgentB2CHotelValidator } from '../utils/validators/agentB2CHotel.validator';

export class AgentB2CHotelController extends AbstractController {
  private service = new AgentB2CHotelService();
  private validator = new AgentB2CHotelValidator();
  constructor() {
    super();
  }

  public hotelSearch = this.asyncWrapper.wrap(
    { bodySchema: this.validator.searchValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.hotelSearch(req);
      res.status(code).json(rest);
    }
  );

  public hotelRooms = this.asyncWrapper.wrap(
    { bodySchema: this.validator.getHotelRoomsValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getHotelRooms(req);
      res.status(code).json(rest);
    }
  );

  public hotelRoomRecheck = this.asyncWrapper.wrap(
    { bodySchema: this.validator.hotelRoomRecheck },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.hotelRoomRecheck(req);
      res.status(code).json(rest);
    }
  );
}
