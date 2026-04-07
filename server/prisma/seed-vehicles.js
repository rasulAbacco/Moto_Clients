import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Vehicle Type
  const carType = await prisma.vehicleType.upsert({
    where: { name: "Car" },
    update: {},
    create: { name: "Car" },
  });

  // 2. Brand
  const tata = await prisma.brand.upsert({
    where: { name: "Tata" },
    update: {},
    create: {
      name: "Tata",
      vehicleTypeId: carType.id,
    },
  });

  const hyundai = await prisma.brand.upsert({
    where: { name: "Hyundai" },
    update: {},
    create: {
      name: "Hyundai",
      vehicleTypeId: carType.id,
    },
  });

  // 3. Models
  const nexon = await prisma.model.create({
    data: {
      name: "Nexon",
      brandId: tata.id,
      segment: "SUV",
    },
  });

  const creta = await prisma.model.create({
    data: {
      name: "Creta",
      brandId: hyundai.id,
      segment: "SUV",
    },
  });

  // 4. ModelYear with images ✅ IMPORTANT
  await prisma.modelYear.create({
    data: {
      modelId: nexon.id,
      year: 2024,
      thumbnailUrl:
        "https://imgd.aeplcdn.com/664x374/n/cw/ec/41645/nexon-exterior-right-front-three-quarter.jpeg",
    },
  });

  await prisma.modelYear.create({
    data: {
      modelId: creta.id,
      year: 2024,
      thumbnailUrl:
        "https://imgd.aeplcdn.com/664x374/n/cw/ec/115777/creta-exterior-right-front-three-quarter.jpeg",
    },
  });

  console.log("✅ Vehicles seeded with images");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());