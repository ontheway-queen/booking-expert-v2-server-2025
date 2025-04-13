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
        } as ITokenParseAdmin;
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
      return res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
    }

    const authSplit = authorization.split(' ');

    if (authSplit.length !== 2) {
      return res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
    }

    const verify = Lib.verifyToken(
      authSplit[1],
      config.JWT_SECRET_USER
    ) as ITokenParseUser;

    if (!verify) {
      return res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
    } else {
      req.user = verify as ITokenParseUser;
      console.log({ user: req.user });
      next();
    }
  };

  // agency user auth checker
  public agencyUserAuthChecker = async (
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
          } as ITokenParseAgencyUser;
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
      return res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
    }

    const authSplit = authorization.split(' ');

    if (authSplit.length !== 2) {
      return res.status(StatusCode.HTTP_UNAUTHORIZED).json({
        success: false,
        message: ResMsg.HTTP_UNAUTHORIZED,
      });
    }

    const verify = Lib.verifyToken(
      authSplit[1],
      config.JWT_SECRET_USER
    ) as ITokenParseAgencyB2CUser;

    if (!verify) {
      return res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
    } else {
      req.agencyB2CUser = verify as ITokenParseAgencyB2CUser;
      console.log({ user: req.user });
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
