export interface IAdminAgentCreateSupportTicketReqBody {
  subject: string;
  agent_id: number;
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

export interface IAdminAgentGetSupportTicketReqQuery {
  agent_id?: number;
  status?: 'Open' | 'Closed' | 'ReOpen';
  from_date?: string;
  to_date?: string;
  limit?: number;
  skip?: number;
}
