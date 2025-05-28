import AbstractRouter from '../../../abstract/abstract.router';
import { B2CHotelController } from '../controllers/b2cHotel.controller';

export default class B2CHotelRouter extends AbstractRouter {
  private controller = new B2CHotelController();
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
