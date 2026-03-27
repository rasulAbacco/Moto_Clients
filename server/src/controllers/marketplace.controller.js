import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getMarketplaceServices = async (req, res) => {
  const { vehicleType } = req.query;

  try {
    // 🔹 1. Resolve vehicle type
    let vehicleTypeId = null;

    if (vehicleType) {
      const vt = await prisma.vehicleType.findFirst({
        where: {
          name: {
            equals: vehicleType,
            mode: "insensitive",
          },
        },
      });

      vehicleTypeId = vt?.id;
    }

    // 🔹 2. Fetch all services with relations
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(vehicleTypeId && { vehicleTypeId }),
      },
      include: {
        section: {
          include: {
            mainService: true,
          },
        },
        garages: {
          include: {
            garage: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // 🔥 3. GROUP DATA → MainService → Section → Services
    const grouped = {};

    services.forEach((s) => {
      const mainName = s.section.mainService.name;
      const sectionName = s.section.name;

      if (!grouped[mainName]) {
        grouped[mainName] = {
          id: s.section.mainService.id,
          name: mainName,
          sections: {},
        };
      }

      if (!grouped[mainName].sections[sectionName]) {
        grouped[mainName].sections[sectionName] = {
          id: s.section.id,
          name: sectionName,
          services: [],
        };
      }

      // 🔹 garages mapping
      const garages = s.garages.map((gs) => {
        const price = gs.price ?? s.price;

        return {
          garageId: gs.garage.id,
          garageName: gs.garage.name,
          city: gs.garage.city,

          price,
          finalPrice: price,

          latitude: gs.garage.latitude,
          longitude: gs.garage.longitude,
        };
      });

      grouped[mainName].sections[sectionName].services.push({
        serviceId: s.id,
        serviceName: s.name,
        basePrice: s.price,
        garages,
      });
    });

    // 🔹 4. Convert object → array
    const formatted = Object.values(grouped).map((main) => ({
      id: main.id,
      name: main.name,
      sections: Object.values(main.sections),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Marketplace Error:", err);
    res.status(500).json({ message: err.message });
  }
};
