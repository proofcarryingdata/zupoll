/* eslint-disable no-var */

import { PrismaClient } from "@prisma/client";

// This is to prevent prisma clients from accumulating during hot reloading
// https://github.com/prisma/prisma/issues/1983
// https://github.com/facebook/jest/issues/11640

declare global {
  var prisma: PrismaClient;
}

export const prisma = global.prisma || new PrismaClient({ log: ["info"] });
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
