import { Request, Response, NextFunction } from "express";
import { verify, JwtPayload } from "jsonwebtoken";
import { IS_PROD } from "./isProd";

export const ACCESS_TOKEN_SECRET = IS_PROD
  ? process.env.ACCESS_TOKEN_SECRET
  : "secret";


export const PARTICIPANTS_GROUP_ID = "1"
export const ADMIN_GROUP_ID = "4"

export const SEMAPHORE_GROUP_URL = IS_PROD
  ? process.env.SEMAPHORE_GROUP_URL
  : `http://localhost:3002/semaphore/${PARTICIPANTS_GROUP_ID}`;

export const SEMAPHORE_ADMIN_GROUP_URL = IS_PROD
  ? process.env.SEMAPHORE_ADMIN_GROUP_URL
  : `http://localhost:3002/semaphore/${ADMIN_GROUP_ID}`;


export const PASSPORT_SERVER = IS_PROD ? process.env.PASSPORT_SERVER : "http://localhost:3002/";

export interface GroupJwtPayload extends JwtPayload {
  groupUrl: string
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    verify(token, ACCESS_TOKEN_SECRET!, (err, group) => {
      if (err) {
        return res.sendStatus(403);
      }

      // Code to gate certain information
      // const payload = group as GroupJwtPayload;
      // if (SEMAPHORE_GROUP_URL.includes(payload.groupUrl)) {
      //     return res.sendStatus(403);
      // }

      next();
    });
  } else {
    res.sendStatus(401);
  }
}

export function isHistoricParticipantGroupUrl(url: string) {
  const regex = new RegExp(`^${PASSPORT_SERVER}/semaphore/historic/${PARTICIPANTS_GROUP_ID}/.*$`)
  return regex.test(url);
}