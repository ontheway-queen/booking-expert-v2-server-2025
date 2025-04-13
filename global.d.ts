import {} from '';
import { Knex } from 'knex';
import {
  ITokenParseAdmin,
  ITokenParseAgency,
  ITokenParseAgencyB2CUser,
  ITokenParseAgencyUser,
  ITokenParseUser,
  IValidateAPIAgencyData,
  IValidateAPIExternalData,
} from './src/features/public/utils/types/publicCommon.types';
declare global {
  namespace Express {
    interface Request {
      agencyUser: ITokenParseAgencyUser;
      user: ITokenParseUser;
      admin: ITokenParseAdmin;
      agencyB2CUser: ITokenParseAgencyB2CUser;
      agentAPI: IValidateAPIAgencyData;
      external: IValidateAPIExternalData;
      upFiles: string[];
    }
  }
}
