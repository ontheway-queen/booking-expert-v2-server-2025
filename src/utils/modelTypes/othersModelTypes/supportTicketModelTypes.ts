export interface IInsertSupportTicketPayload {
  support_no: string;
  source_type: 'AGENT' | 'AGENT B2C' | 'B2C';
  source_id: number;
  user_id: number;
  ref_id?: number;
  ref_type:
    | 'Flight'
    | 'Visa'
    | 'Hotel'
    | 'Holiday'
    | 'Umrah'
    | 'Others'
    | 'Accounts'
    | 'Payments';
  subject: string;
  priority?: string;
  last_message_id?: number;
}

export interface IGetAgencySupportTicketListData {
  id: number;
  support_no: string;
  subject: string;
  status: 'Open' | 'Closed' | 'ReOpen';
  agency_name: string;
  ref_type:
    | 'Flight'
    | 'Visa'
    | 'Hotel'
    | 'Holiday'
    | 'Umrah'
    | 'Others'
    | 'Accounts'
    | 'Payments';
  last_message: string;
  reply_by: 'Admin' | 'Customer';
  last_message_created_at: string;
  created_at: string;
}

export interface IGetAgencySupportTicketListQuery {
  status?: 'Open' | 'Closed' | 'ReOpen';
  agent_id?: number;
  user_id?: number;
  reply_by?: 'Admin' | 'Customer';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  limit?: number;
  skip?: number;
  from_date?: string;
  to_date?: string;
  ref_type?:
    | 'Flight'
    | 'Visa'
    | 'Hotel'
    | 'Holiday'
    | 'Umrah'
    | 'Others'
    | 'Accounts'
    | 'Payments';
}
export interface IGetSingleAgentSupportTicketData {
  id: number;
  support_no: string;
  ref_type:
    | 'Flight'
    | 'Visa'
    | 'Hotel'
    | 'Holiday'
    | 'Umrah'
    | 'Others'
    | 'Accounts'
    | 'Payments';
  ref_id?: number;
  source_id: number;
  subject: string;
  status: 'Open' | 'Closed' | 'ReOpen';
  agency_name: string;
  agency_logo: string;
  created_by_name: string;
  created_by_photo: string;
  created_at: string;
}

export interface IInsertSupportTicketMessagePayload {
  support_ticket_id: number;
  sender_id: number;
  message: string;
  attachments?: string;
  reply_by: 'Admin' | 'Customer';
}

export interface IGetSupportTicketMessagesData {
  id: number;
  support_ticket_id: number;
  sender_id: number;
  sender_name: string;
  sender_photo: string;
  message: string;
  attachments: string;
  reply_by: 'Admin' | 'Customer';
  created_at: string;
}
