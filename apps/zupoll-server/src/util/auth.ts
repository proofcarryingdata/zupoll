import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { IS_DEPLOYED } from "./deployment";

export const ACCESS_TOKEN_SECRET = IS_DEPLOYED
  ? process.env.ACCESS_TOKEN_SECRET
  : "secret";

export const PARTICIPANTS_GROUP_ID = "1";
export const ADMIN_GROUP_ID = "4";
export const PCDPASS_GROUP_ID = "5";

export const ZUZALU_PARTICIPANTS_GROUP_URL = IS_DEPLOYED
  ? process.env.SEMAPHORE_GROUP_URL
  : `http://localhost:3002/semaphore/${PARTICIPANTS_GROUP_ID}`;

export const ZUZALU_ORGANIZERS_GROUP_URL = IS_DEPLOYED
  ? process.env.SEMAPHORE_ADMIN_GROUP_URL
  : `http://localhost:3002/semaphore/${ADMIN_GROUP_ID}`;

export const PCDPASS_USERS_GROUP_URL = IS_DEPLOYED
  ? process.env.PCDPASS_USERS_GROUP_URL
  : `http://localhost:3002/semaphore/${PCDPASS_GROUP_ID}`;

export const ZUZALU_HISTORIC_API_URL = IS_DEPLOYED
  ? process.env.SEMAPHORE_HISTORIC_URL
  : "http://localhost:3002/semaphore/valid-historic/";

export const PCDPASS_HISTORIC_API_URL = IS_DEPLOYED
  ? process.env.PCDPASS_HISTORIC_API_URL
  : "http://localhost:3002/semaphore/valid-historic/";

export const SITE_URL = process.env.SITE_URL ?? "https://zupoll.org/";

export interface GroupJwtPayload extends JwtPayload {
  groupUrl: string;
}

export const authenticateZuzaluJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    verify(token, ACCESS_TOKEN_SECRET!, (err, _group) => {
      if (err) {
        return res.sendStatus(403);
      }

      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export const authenticateZuzaluOrganizerJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    verify(token, ACCESS_TOKEN_SECRET!, (err, group) => {
      if (err) {
        return res.sendStatus(403);
      }

      const payload = group as GroupJwtPayload;
      if (
        ZUZALU_PARTICIPANTS_GROUP_URL &&
        payload.groupUrl.includes(ZUZALU_PARTICIPANTS_GROUP_URL)
      ) {
        return res.sendStatus(403);
      }

      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export const authenticatePCDPassJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    verify(token, ACCESS_TOKEN_SECRET!, (err, group) => {
      if (err) {
        return res.sendStatus(403);
      }

      const payload = group as GroupJwtPayload;
      if (
        PCDPASS_USERS_GROUP_URL &&
        payload.groupUrl.includes(PCDPASS_USERS_GROUP_URL)
      ) {
        return res.sendStatus(403);
      }

      next();
    });
  } else {
    res.sendStatus(401);
  }
};
