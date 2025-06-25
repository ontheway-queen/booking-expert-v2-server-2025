import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import {
  IAgentCreateSupportTicketReqBody,
  IAgentGetSupportTicketReqQuery,
} from '../utils/types/agentSupportTicket.types';
import Lib from '../../../utils/lib/lib';
import { SOURCE_AGENT } from '../../../utils/miscellaneous/constants';

export class AgentSupportTicketService extends AbstractServices {
  constructor() {
    super();
  }

  public async createSupportTicket(req: Request) {
    return this.db.transaction(async (trx) => {
      const data = req.body as IAgentCreateSupportTicketReqBody;
      const { user_id, agency_id } = req.agencyUser;
      const supportTicketModel = this.Model.SupportTicketModel(trx);

      const support_no = await Lib.generateNo({
        trx,
        type: 'Agent_SupportTicket',
      });

      const files = (req.files as Express.Multer.File[]) || [];

      const ticket = await supportTicketModel.createSupportTicket({
        ref_type: data.ref_type,
        ref_id: data.ref_id,
        subject: data.subject,
        priority: data.priority,
        user_id,
        source_id: agency_id,
        source_type: SOURCE_AGENT,
        support_no,
      });

      const msg = await supportTicketModel.insertSupportTicketMessage({
        support_ticket_id: ticket[0].id,
        message: data.details,
        reply_by: 'Customer',
        sender_id: user_id,
        attachments: JSON.stringify(files.map((file) => file.filename)),
      });

      await supportTicketModel.updateSupportTicket(
        {
          last_message_id: msg[0].id,
        },
        ticket[0].id,
        SOURCE_AGENT
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: {
          id: ticket[0].id,
          support_no,
          message: [
            {
              id: msg[0].id,
              attachments: JSON.stringify(files.map((file) => file.filename)),
            },
          ],
        },
      };
    });
  }

  public async getSupportTicket(req: Request) {
    const { agency_id } = req.agencyUser;
    const supportTicketModel = this.Model.SupportTicketModel();
    const query = req.query as IAgentGetSupportTicketReqQuery;

    const data = await supportTicketModel.getAgentSupportTicket(
      {
        agent_id: agency_id,
        ...query,
      },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: data.data,
      total: data.total,
    };
  }

  public async getSingleSupportTicketWithMsg(req: Request) {
    const { agency_id } = req.agencyUser;
    const { id } = req.params;
    const ticket_id = Number(id);

    const supportTicketModel = this.Model.SupportTicketModel();

    const ticket = await supportTicketModel.getSingleAgentSupportTicket(
      ticket_id
    );

    if (!ticket || ticket?.source_id !== agency_id) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const msgs = await supportTicketModel.getAgentSupportTicketMessages({
      support_ticket_id: ticket_id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...ticket,
        conversations: msgs,
      },
    };
  }

  public async getSupportTicketMsg(req: Request) {
    const { agency_id } = req.agencyUser;
    const { id } = req.params;
    const query = req.query as {
      limit?: number;
      skip?: number;
    };
    const ticket_id = Number(id);
    const supportTicketModel = this.Model.SupportTicketModel();

    const ticket = await supportTicketModel.getSingleAgentSupportTicket(
      ticket_id
    );

    if (!ticket || ticket?.source_id !== agency_id) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const msgs = await supportTicketModel.getAgentSupportTicketMessages({
      support_ticket_id: ticket_id,
      limit: query.limit,
      skip: query.skip,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: msgs,
    };
  }

  public async sendSupportTicketReplay(req: Request) {}

  public async closeSupportTicket(req: Request) {}
}
