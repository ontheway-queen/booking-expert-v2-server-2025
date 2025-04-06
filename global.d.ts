import {} from '';
declare global {
  namespace Express {
    interface Request {
      agency: {
        agency_id: number;
        user_id: number;
        user_email: string;
        username: string;
        user_full_name: string;
      };
      user: {
        user_id: number;
        username: string;
        user_full_name: string;
        user_email: string;
      };
      admin: {
        user_id: number;
        username: string;
        user_full_name: string;
        user_email: string;
      };
      agencyB2CUser: {
        agency_id: number;
        user_id: number;
        user_email: string;
        username: string;
        user_full_name: string;
      };
      trx: Knex.Transaction;
      upFiles: string[];
    }
  }
}
