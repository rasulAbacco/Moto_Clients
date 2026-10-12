import pkg from "@prisma/client";
const { PrismaClient } = pkg;

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient({
    log: ["error", "warn"],
  });
}

prisma = global.prisma;

export default prisma;
