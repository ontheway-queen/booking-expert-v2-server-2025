import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import Lib from '../../../utils/lib/lib';
import {
  SOURCE_AGENT,
  SOURCE_AGENT_B2C,
} from '../../../utils/miscellaneous/constants';
import { IUpdateSupportTicketPayload } from '../../../utils/modelTypes/othersModelTypes/supportTicketModelTypes';
import {
  IAgentB2CCreateSupportTicketReqBody,
  IAgentB2CGetSupportTicketReqQuery,
} from '../utils/types/agentB2CSupportTicket.types';

export class AgentB2CSupportTicketService extends AbstractServices {
  constructor() {
    super();
  }

  public async createSupportTicket(req: Request) {
    return this.db.transaction(async (trx) => {
      const data = req.body as IAgentB2CCreateSupportTicketReqBody;
      const { user_id, agency_id } = req.agencyB2CUser;
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
        created_by_user_id: user_id,
        created_by: 'Customer',
        source_id: agency_id,
        source_type: SOURCE_AGENT_B2C,
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
        SOURCE_AGENT_B2C
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
    const { agency_id, user_id } = req.agencyB2CUser;
    const supportTicketModel = this.Model.SupportTicketModel();
    const query = req.query as IAgentB2CGetSupportTicketReqQuery;

    const data = await supportTicketModel.getAgentB2CSupportTicket(
      {
        source_id: agency_id,
        created_by_user_id: user_id,
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
    const { agency_id, user_id } = req.agencyB2CUser;
    const { id } = req.params;
    const ticket_id = Number(id);

    const supportTicketModel = this.Model.SupportTicketModel();

    const ticket = await supportTicketModel.getSingleAgentB2CSupportTicket({
      id: ticket_id,
      source_id: agency_id,
      created_by_user_id: user_id,
    });

    if (!ticket) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const msgs = await supportTicketModel.getAgentSupportTicketMessages({
      support_ticket_id: ticket_id,
    });

    const { agency_logo, agency_name, source_id, ...rest } = ticket;

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...rest,
        conversations: msgs,
      },
    };
  }

  public async getSupportTicketMsg(req: Request) {
    const { agency_id, user_id } = req.agencyB2CUser;
    const { id } = req.params;
    const query = req.query as {
      limit?: number;
      skip?: number;
    };
    const ticket_id = Number(id);
    const supportTicketModel = this.Model.SupportTicketModel();

    const ticket = await supportTicketModel.getSingleAgentB2CSupportTicket({
      id: ticket_id,
      source_id: agency_id,
      created_by_user_id: user_id,
    });

    if (!ticket) {
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

  public async sendSupportTicketReplay(req: Request) {
    return this.db.transaction(async (trx) => {
      const { user_id, agency_id } = req.agencyB2CUser;
      const support_ticket_id = Number(req.params.id);
      const { message } = req.body as { message: string };
      const supportTicketModel = this.Model.SupportTicketModel(trx);

      const ticket = await supportTicketModel.getSingleAgentB2CSupportTicket({
        id: support_ticket_id,
        source_id: agency_id,
        created_by_user_id: user_id,
      });

      if (!ticket) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const newMsg = await supportTicketModel.insertSupportTicketMessage({
        message,
        reply_by: 'Customer',
        sender_id: user_id,
        support_ticket_id,
        attachments: JSON.stringify(files.map((file) => file.filename)),
      });

      const payload: IUpdateSupportTicketPayload = {
        last_message_id: newMsg[0].id,
      };

      if (ticket.status === 'Closed') {
        payload.status = 'ReOpen';
        payload.reopen_by = 'Customer';
        payload.reopen_date = new Date();
      }

      await supportTicketModel.updateSupportTicket(
        payload,
        support_ticket_id,
        SOURCE_AGENT
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: {
          id: newMsg[0].id,
        },
      };
    });
  }

  public async closeSupportTicket(req: Request) {
    return this.db.transaction(async (trx) => {
      const support_ticket_id = Number(req.params.id);
      const { user_id, agency_id } = req.agencyB2CUser;

      const supportTicketModel = this.Model.SupportTicketModel(trx);

      const ticket = await supportTicketModel.getSingleAgentB2CSupportTicket({
        id: support_ticket_id,
        source_id: agency_id,
        created_by_user_id: user_id,
      });

      if (!ticket) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (ticket.status === 'Closed') {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'This ticket is already closed.',
        };
      }

      await supportTicketModel.updateSupportTicket(
        {
          close_date: new Date(),
          closed_by: 'Customer',
          closed_by_user_id: user_id,
          status: 'Closed',
        },
        support_ticket_id,
        SOURCE_AGENT_B2C
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }
}
