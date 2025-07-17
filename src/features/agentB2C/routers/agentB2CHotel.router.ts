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
    this.router
      .route('/booking')
      .post(
        this.uploader.cloudUploadRaw(
          this.fileFolders.AGENT_B2C_HOTEL_BOOKING_FILES
        ),
        this.controller.hotelBooking
      )
      .get(this.controller.getHotelBooking);
    this.router
      .route('/booking/:id')
      .get(this.controller.getSingleHotelBooking);
  }
}
