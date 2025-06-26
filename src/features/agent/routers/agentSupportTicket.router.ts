import AbstractRouter from '../../../abstract/abstract.router';
import { AgentSupportTicketController } from '../controllers/agentSupportTicket.controller';

export default class AgentSupportTicketRouter extends AbstractRouter {
  private controller = new AgentSupportTicketController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .post(
        this.uploader.cloudUploadRaw(
          this.fileFolders.AGENT_SUPPORT_TICKET_FILES,
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
          this.fileFolders.AGENT_SUPPORT_TICKET_FILES,
          ['attachment']
        ),
        this.controller.sendSupportTicketReplay
      );
  }
}
