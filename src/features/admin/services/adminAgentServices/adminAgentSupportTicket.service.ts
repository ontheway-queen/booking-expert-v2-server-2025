import { Request } from 'express';
import AbstractServices from '../../../../abstract/abstract.service';
import {
  IAdminAgentCreateSupportTicketReqBody,
  IAdminAgentGetSupportTicketReqQuery,
} from '../../utils/types/adminAgentSupportTicket.types';
import Lib from '../../../../utils/lib/lib';
import { SOURCE_AGENT } from '../../../../utils/miscellaneous/constants';
import { IUpdateSupportTicketPayload } from '../../../../utils/modelTypes/othersModelTypes/supportTicketModelTypes';

export class AdminAgentSupportTicketService extends AbstractServices {
  constructor() {
    super();
  }

  public async createSupportTicket(req: Request) {
    return this.db.transaction(async (trx) => {
      const data = req.body as IAdminAgentCreateSupportTicketReqBody;
      const { user_id } = req.admin;
      const supportTicketModel = this.Model.SupportTicketModel(trx);
      const agencyModel = this.Model.AgencyModel(trx);

      const checkAgent = await agencyModel.checkAgency({
        agency_id: data.agent_id,
      });

      if (!checkAgent) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
          message: 'Invalid agent id.',
        };
      }

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
        created_by: 'Admin',
        source_id: data.agent_id,
        source_type: SOURCE_AGENT,
        support_no,
      });

      const msg = await supportTicketModel.insertSupportTicketMessage({
        support_ticket_id: ticket[0].id,
        message: data.details,
        reply_by: 'Admin',
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
    const supportTicketModel = this.Model.SupportTicketModel();
    const query = req.query as IAdminAgentGetSupportTicketReqQuery;

    const data = await supportTicketModel.getAgentSupportTicket(
      {
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
    const { id } = req.params;
    const ticket_id = Number(id);

    const supportTicketModel = this.Model.SupportTicketModel();

    const ticket = await supportTicketModel.getSingleAgentSupportTicket({
      id: ticket_id,
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
    const { id } = req.params;
    const query = req.query as {
      limit?: number;
      skip?: number;
    };
    const ticket_id = Number(id);
    const supportTicketModel = this.Model.SupportTicketModel();

    const ticket = await supportTicketModel.getSingleAgentSupportTicket({
      id: ticket_id,
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
      const { user_id } = req.admin;
      const support_ticket_id = Number(req.params.id);
      const { message } = req.body as { message: string };
      const supportTicketModel = this.Model.SupportTicketModel(trx);

      const ticket = await supportTicketModel.getSingleAgentSupportTicket({
        id: support_ticket_id,
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
        reply_by: 'Admin',
        sender_id: user_id,
        support_ticket_id,
        attachments: JSON.stringify(files.map((file) => file.filename)),
      });

      const payload: IUpdateSupportTicketPayload = {
        last_message_id: newMsg[0].id,
      };

      if (ticket.status === 'Closed') {
        payload.status = 'ReOpen';
        payload.reopen_by = 'Admin';
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
      const { user_id } = req.admin;

      const supportTicketModel = this.Model.SupportTicketModel(trx);

      const ticket = await supportTicketModel.getSingleAgentSupportTicket({
        id: support_ticket_id,
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
          closed_by: 'Admin',
          closed_by_user_id: user_id,
          status: 'Closed',
        },
        support_ticket_id,
        SOURCE_AGENT
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }
}
