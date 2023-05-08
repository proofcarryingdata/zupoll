import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { IS_DEPLOYED } from "./deployment";

export const ACCESS_TOKEN_SECRET = IS_DEPLOYED
  ? process.env.ACCESS_TOKEN_SECRET
  : "secret";

export const PARTICIPANTS_GROUP_ID = "1";
export const ADMIN_GROUP_ID = "4";

export const SEMAPHORE_GROUP_URL = IS_DEPLOYED
  ? process.env.SEMAPHORE_GROUP_URL
  : `http://localhost:3002/semaphore/${PARTICIPANTS_GROUP_ID}`;

export const SEMAPHORE_ADMIN_GROUP_URL = IS_DEPLOYED
  ? process.env.SEMAPHORE_ADMIN_GROUP_URL
  : `http://localhost:3002/semaphore/${ADMIN_GROUP_ID}`;

export const SEMAPHORE_HISTORIC_URL = IS_DEPLOYED
  ? process.env.SEMAPHORE_HISTORIC_URL
  : "http://localhost:3002/semaphore/valid-historic/";

export const SITE_URL = process.env.SITE_URL ?? "https://zupoll.org/";

export interface GroupJwtPayload extends JwtPayload {
  groupUrl: string;
}

export const authenticateJWT = (
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

export const authenticateOrganizerJWT = (
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
        SEMAPHORE_GROUP_URL &&
        payload.groupUrl.includes(SEMAPHORE_GROUP_URL)
      ) {
        return res.sendStatus(403);
      }

      next();
    });
  } else {
    res.sendStatus(401);
  }
};
