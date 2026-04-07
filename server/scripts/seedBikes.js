import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

const bikes = JSON.parse(
  fs.readFileSync("./src/data/bikes-data.json", "utf-8"),
);

async function seedBikes() {
  const vehicleType = await prisma.vehicleType.findFirst({
    where: { name: "Bike" },
  });

  if (!vehicleType) {
    throw new Error("VehicleType 'Bike' not found in DB");
  }

  for (const brand of bikes) {
    const createdBrand = await prisma.brand.upsert({
      where: { name: brand.make }, // ✅ FIX
      update: {},
      create: {
        name: brand.make,
        vehicleTypeId: vehicleType.id,
      },
    });

    for (const model of brand.models) {
      await prisma.model.create({
        data: {
          name: model.name,
          brandId: createdBrand.id,
          segment: "SUV", // ⚠️ TEMP FIX (see below)
        },
      });
    }
  }

  console.log("✅ Bikes seeded successfully");
}

seedBikes()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });