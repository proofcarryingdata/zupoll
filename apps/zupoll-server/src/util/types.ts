export type Unarray<T> = T extends Array<infer U> ? U : T;

export enum AuthType {
  PCDPASS = "PCDPASS",
  ZUZALU_ORGANIZER = "ZUZALU_ORGANIZER",
  ZUZALU_PARTICIPANT = "ZUZALU_PARTICIPANT",
  DEVCONNECT_PARTICIPANT = "DEVCONNECT_PARTICIPANT",
  DEVCONNECT_ORGANIZER = "DEVCONNECT_ORGANIZER",
}

declare global {
  namespace Express {
    export interface Request {
      authUserType?: AuthType;
    }
  }
}
