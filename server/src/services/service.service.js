import  {PrismaClient} from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Get all main services
 */
const getMainServices = async () => {
  return await prisma.mainService.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
};

/**
 * Get one main service with sections + sub services
 */
const getMainServiceById = async (id) => {
  return await prisma.mainService.findUnique({
    where: { id },
    include: {
      sections: {
        include: {
          services: {
            where: { isActive: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
};

const getSubServiceById = async (id) => {
  return await prisma.service.findUnique({
    where: { id },
    include: {
      section: {
        include: {
          mainService: true,
        },
      },
    },
  });
};



export default {
  getMainServices,
  getMainServiceById,
  getSubServiceById,
};
