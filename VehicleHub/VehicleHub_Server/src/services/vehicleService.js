// services/vehicleService.js
import { prisma } from "../config/db.js";
import { paginate } from "../utils/pagination.js";

const slugify = (title = "") =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") +
  "-" +
  Date.now().toString(36);

class VehicleService {
  async createVehicle(payload) {
    return prisma.vehicle.create({
      data: { ...payload, slug: slugify(payload.title) },
    });
  }

  async getAllVehicles(query = {}) {
    const { skip, take, page, limit } = paginate(query.page, query.limit);
    const where = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { brand: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.status) where.status = query.status;
    if (query.brand) where.brand = query.brand;
    if (query.fuelType) where.fuelType = query.fuelType;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isFeatured !== undefined)
      where.isFeatured =
        query.isFeatured === true || query.isFeatured === "true";

    const [items, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getHomepageVehicles() {
    const where = {
      isApproved: true,
      status: "AVAILABLE",
    };
    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const byCategory = vehicles.reduce((groups, vehicle) => {
      const category = vehicle.category || "Other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(vehicle);
      return groups;
    }, {});

    return {
      categories: Object.keys(byCategory),
      byCategory,
      electric: vehicles.filter((vehicle) => vehicle.fuelType === "Electric"),
      latest: vehicles.slice(0, 8),
    };
  }

  async getVehicleById(id) {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  async updateVehicle(id, payload) {
    return prisma.vehicle.update({ where: { id }, data: payload });
  }

  async deleteVehicle(id) {
    return prisma.vehicle.delete({ where: { id } });
  }
}

// ✅ Export as default for ES modules
export default new VehicleService();
