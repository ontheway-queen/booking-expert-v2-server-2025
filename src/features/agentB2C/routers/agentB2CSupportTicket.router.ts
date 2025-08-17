import AbstractRouter from '../../../abstract/abstract.router';
import { AgentB2CSupportTicketController } from '../controllers/agentB2CSupportTicket.controller';

export default class AgentB2CSupportTicketRouter extends AbstractRouter {
  private controller = new AgentB2CSupportTicketController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .post(
        this.uploader.cloudUploadRaw(
          this.fileFolders.AGENT_B2C_SUPPORT_TICKET_FILES,
          ['attachment']
        ),
        this.controller.createSupportTicker
      )
      .get(this.controller.getSupportTicket);

    this.router
      .route('/:id')
      .get(this.controller.getSingleSupportTicket)
      .post(this.controller.closeSupportTicket);

    this.router
      .route('/:id/conversations')
      .get(this.controller.getSupportTicketMsg)
      .post(
        this.uploader.cloudUploadRaw(
          this.fileFolders.AGENT_B2C_SUPPORT_TICKET_FILES,
          ['attachment']
        ),
        this.controller.sendSupportTicketReplay
      );
  }
}
