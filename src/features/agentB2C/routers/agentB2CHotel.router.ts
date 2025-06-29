import AbstractRouter from '../../../abstract/abstract.router';
import { AgentB2CHotelController } from '../controllers/agentB2CHotel.controller';

export default class AgentB2CHotelRouter extends AbstractRouter {
  private controller = new AgentB2CHotelController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.post('/search', this.controller.hotelSearch);
    this.router.post('/rooms', this.controller.hotelRooms);
    this.router.post('/room/recheck', this.controller.hotelRoomRecheck);
  }
}
