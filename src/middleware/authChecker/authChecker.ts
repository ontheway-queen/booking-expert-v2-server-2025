import { NextFunction, Request, Response } from 'express';
import StatusCode from '../../utils/miscellaneous/statusCode';
import ResMsg from '../../utils/miscellaneous/responseMessage';
import Lib from '../../utils/lib/lib';
import config from '../../config/config';
import {
  ITokenParseAdmin,
  ITokenParseAgency,
  ITokenParseAgencyB2CUser,
  ITokenParseUser,
} from '../../features/public/utils/types/publicCommon.types';

class AuthChecker {
  // admin auth checker
  public adminAuthChecker = async (
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
      config.JWT_SECRET_ADMIN
    ) as ITokenParseAdmin;

    if (!verify) {
      return res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
    } else {
      req.admin = verify as ITokenParseAdmin;
      next();
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
      config.JWT_SECRET_AGENT
    ) as ITokenParseAgency;

    if (!verify) {
      return res
        .status(StatusCode.HTTP_UNAUTHORIZED)
        .json({ success: false, message: ResMsg.HTTP_UNAUTHORIZED });
    } else {
      req.agencyUser = verify as ITokenParseAgency;
      next();
    }
  };

  //Agency B2C user auth checker
  public AgencyB2CUserAuthChecker = async (
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
  public AgencyB2CAPIAccessChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    req.agent = { agency_email: '', agency_id: 1, agency_name: '' };
    next();
  };

  // External API Authorizer
  public ExternalAPIAccessChecker = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    req.external = { external_email: '', external_id: 1, external_name: '' };
    next();
  };
}

export default AuthChecker;
