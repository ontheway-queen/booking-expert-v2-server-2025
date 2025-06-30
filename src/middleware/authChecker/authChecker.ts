import { NextFunction, Request, Response } from 'express';
import StatusCode from '../../utils/miscellaneous/statusCode';
import ResMsg from '../../utils/miscellaneous/responseMessage';
import Lib from '../../utils/lib/lib';
import config from '../../config/config';
import {
  ITokenParseAdmin,
  ITokenParseAgencyUser,
  ITokenParseAgencyB2CUser,
  ITokenParseUser,
} from '../../features/public/utils/types/publicCommon.types';
import AdminModel from '../../models/adminModel/adminModel';
import { db } from '../../app/database';
import AgencyUserModel from '../../models/agentModel/agencyUserModel';
import B2CUserModel from '../../models/b2cModel/b2cUserModel';
import AgencyModel from '../../models/agentModel/agencyModel';
import AgencyB2CUserModel from '../../models/agencyB2CModel/agencyB2CUserModel';

export default class AuthChecker {
  // admin auth checker
  public adminAuthChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { authorization } = req.headers;

    if (!authorization) {
      res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      return;
    }

    const authSplit = authorization.split(' ');

    if (authSplit.length !== 2) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }

    const verify = Lib.verifyToken(
      authSplit[1],
      config.JWT_SECRET_ADMIN
    ) as ITokenParseAdmin;

    if (!verify) {
      res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      return;
    } else {
      const { user_id } = verify;

      const adminModel = new AdminModel(db);

      const checkAdmin = await adminModel.checkUserAdmin({ id: user_id });

      if (checkAdmin) {
        if (!checkAdmin.status) {
          res
            .status(StatusCode.HTTP_UNAUTHORIZED)
            .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
        }

        req.admin = {
          is_main_user: checkAdmin.is_main_user,
          name: checkAdmin.name,
          photo: checkAdmin.photo,
          user_email: checkAdmin.email,
          user_id,
          username: checkAdmin.username,
          phone_number: checkAdmin.phone_number,
        };
        next();
      } else {
        res
          .status(StatusCode.HTTP_UNAUTHORIZED)
          .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      }
    }
  };

  //B2C user auth checker
  public b2cUserAuthChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { authorization } = req.headers;
    if (!authorization) {
      res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      return;
    }

    const authSplit = authorization.split(' ');

    if (authSplit.length !== 2) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }

    const verify = Lib.verifyToken(
      authSplit[1],
      config.JWT_SECRET_USER
    ) as ITokenParseUser;

    if (!verify) {
      res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      return;
    } else {
      const { user_id } = verify;
      const userModel = new B2CUserModel(db);

      const user = await userModel.checkUser({ id: user_id });

      if (user) {
        if (!user.status) {
          res
            .status(StatusCode.HTTP_UNAUTHORIZED)
            .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
        }

        req.user = {
          name: user?.name,
          phone_number: user?.phone_number,
          photo: user?.photo,
          user_email: user?.email,
          user_id,
          username: user?.username,
        };
        next();
      } else {
        res
          .status(StatusCode.HTTP_UNAUTHORIZED)
          .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      }
    }
  };

  // agency user auth checker
  public agencyUserAuthChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let { authorization } = req.headers;
    if (!authorization) authorization = req.query.token as string;
    if (!authorization) {
      res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });

      return;
    }

    const authSplit = authorization.split(' ');

    if (authSplit.length !== 2) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }

    const verify = Lib.verifyToken(
      authSplit[1],
      config.JWT_SECRET_AGENT
    ) as ITokenParseAgencyUser;

    if (!verify) {
      res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      return;
    } else {
      const { user_id } = verify;

      const agencyUserModel = new AgencyUserModel(db);

      const checkAgencyUser = await agencyUserModel.checkUser({ id: user_id });

      if (checkAgencyUser) {
        if (!checkAgencyUser.status) {
          res
            .status(StatusCode.HTTP_UNAUTHORIZED)
            .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
          return;
        }

        if (
          checkAgencyUser.agency_status === 'Inactive' ||
          checkAgencyUser.agency_status === 'Incomplete' ||
          checkAgencyUser.agency_status === 'Rejected'
        ) {
          res.status(StatusCode.HTTP_UNAUTHORIZED).json({
            success: false,
            message: ResMsg.HTTP_UNAUTHORIZED,
          });
          return;
        } else {
          req.agencyUser = {
            agency_email: checkAgencyUser.agency_email,
            agency_id: checkAgencyUser.agency_id,
            agency_name: checkAgencyUser.agency_name,
            is_main_user: checkAgencyUser.is_main_user,
            name: checkAgencyUser.name,
            photo: checkAgencyUser.photo,
            user_email: checkAgencyUser.email,
            user_id,
            username: checkAgencyUser.username,
            phone_number: checkAgencyUser.phone_number,
            ref_id: checkAgencyUser.ref_id,
            address: checkAgencyUser.address,
            agency_logo: checkAgencyUser.agency_logo,
          };
          next();
        }
      } else {
        res
          .status(StatusCode.HTTP_UNAUTHORIZED)
          .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
        return;
      }
    }
  };

  //Agency B2C user auth checker
  public agencyB2CUserAuthChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { authorization } = req.headers;
    if (!authorization) {
      res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      return;
    }

    const authSplit = authorization.split(' ');

    if (authSplit.length !== 2) {
      res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
      return;
    }

    const verify = Lib.verifyToken(
      authSplit[1],
      config.JWT_SECRET_AGENT_B2C
    ) as ITokenParseAgencyB2CUser;

    if (!verify) {
      res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      return;
    } else {
      const { agency_id, user_email, user_id } = verify;
      const agencyModel = new AgencyModel(db);
      const agentB2CUserModel = new AgencyB2CUserModel(db);

      const check_agency = await agencyModel.checkAgency({
        agency_id,
      });
      if (!check_agency || check_agency.status !== 'Active') {
        res
          .status(StatusCode.HTTP_UNAUTHORIZED)
          .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
        return;
      }

      const check_agent_b2c = await agentB2CUserModel.checkUser({
        email: user_email,
        agency_id,
      });

      if (!check_agent_b2c || check_agent_b2c.status === false) {
        res
          .status(StatusCode.HTTP_UNAUTHORIZED)
          .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
        return;
      }
      req.agencyB2CUser = {
        agency_id,
        agency_name: String(check_agency?.agency_name),
        agency_email: String(check_agency?.email),
        agency_logo: String(check_agency?.agency_logo),
        agency_address: String(check_agency?.address),
        agency_number: String(check_agency?.phone),
        user_id: user_id,
        photo: String(check_agent_b2c?.photo),
        user_email: String(user_email),
        username: String(check_agent_b2c?.username),
        name: String(check_agent_b2c?.name),
        phone_number: String(check_agent_b2c?.phone_number),
      };
      next();
    }
  };

  // Agency B2C White label Auth Checker
  public whiteLabelAuthChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let { token } = req.headers as { token: string };
    if (!token) token = req.query.agencyToken as string;
    if (!token) {
      res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
      return;
    } else {
      const agencyModel = new AgencyModel(db);
      const check_token = await agencyModel.getWhiteLabelPermission({
        token: token,
      });

      if (!check_token) {
        res
          .status(StatusCode.HTTP_UNAUTHORIZED)
          .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
        return;
      }

      const check_agency = await agencyModel.checkAgency({
        agency_id: check_token?.agency_id,
      });

      if (!check_agency || check_agency.status !== 'Active') {
        res
          .status(StatusCode.HTTP_UNAUTHORIZED)
          .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
        return;
      }

      const module = req.originalUrl.split('/')[4] || '';

      req.agencyB2CWhiteLabel = {
        agency_id: Number(check_token?.agency_id),
        flight: Boolean(check_token?.flight),
        hotel: Boolean(check_token?.hotel),
        visa: Boolean(check_token?.visa),
        holiday: Boolean(check_token?.holiday),
        umrah: Boolean(check_token?.umrah),
        group_fare: Boolean(check_token?.group_fare),
        blog: Boolean(check_token?.blog),
      };

      // Check permission
      type WhiteLabelEndpoint =
        | 'flight'
        | 'hotel'
        | 'visa'
        | 'holiday'
        | 'umrah'
        | 'group_fare'
        | 'blog';

      const endpoint = module as WhiteLabelEndpoint;

      const hasPermission =
        endpoint in req.agencyB2CWhiteLabel &&
        req.agencyB2CWhiteLabel[endpoint] === true;

      if (!hasPermission && module !== 'agent-b2c') {
        res
          .status(StatusCode.HTTP_UNAUTHORIZED)
          .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
        return;
      }
      next();
    }
  };

  // Agency B2C API Authorizer
  public agencyB2CAPIAccessChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    req.agentAPI = { agency_email: '', agency_id: 1, agency_name: '' };
    next();
  };

  // External API Authorizer
  public externalAPIAccessChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    req.external = { external_email: '', external_id: 1, external_name: '' };
    next();
  };
}
