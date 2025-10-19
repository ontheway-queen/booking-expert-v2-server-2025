export interface IAgentB2CSubCreateSupportTicketReqBody {
  subject: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  details: string;
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
}

export interface IAgentB2CSubGetSupportTicketReqQuery {
  status?: 'Open' | 'Closed' | 'ReOpen';
  from_date?: string;
  to_date?: string;
  limit?: number;
  skip?: number;
}
