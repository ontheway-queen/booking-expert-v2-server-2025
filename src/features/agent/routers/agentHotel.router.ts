import AbstractRouter from '../../../abstract/abstract.router';
import AgentHotelController from '../controllers/agentHotel.controller';

export default class AgentHotelRouter extends AbstractRouter {
  private controller = new AgentHotelController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.post('/search', this.controller.hotelSearch);
    this.router.get('/search/history', this.controller.hotelSearchHistory);
    this.router.post('/rooms', this.controller.hotelRooms);
    this.router.post('/room/recheck', this.controller.hotelRoomRecheck);
    this.router
      .route('/booking')
      .post(
        this.uploader.cloudUploadRaw(
          this.fileFolders.AGENT_HOTEL_BOOKING_FILES
        ),
        this.controller.hotelBooking
      )
      .get(this.controller.getHotelBooking);
  }
}
