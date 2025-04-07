import {} from '';
import { Knex } from 'knex';
import {
  ITokenParseAdmin,
  ITokenParseAgency,
  ITokenParseAgencyB2CUser,
  ITokenParseUser,
  IValidateAPIAgencyData,
  IValidateAPIExternalData,
} from './src/features/public/utils/types/publicCommon.types';
declare global {
  namespace Express {
    interface Request {
      agencyUser: ITokenParseAgency;
      user: ITokenParseUser;
      admin: ITokenParseAdmin;
      agencyB2CUser: ITokenParseAgencyB2CUser;
      agent: IValidateAPIAgencyData;
      external: IValidateAPIExternalData;
      upFiles: string[];
    }
  }
}
