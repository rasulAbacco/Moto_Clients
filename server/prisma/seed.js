import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

// Needed because __dirname doesn't exist in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}

async function main() {
  console.log("📄 Reading Excel file...");

  const filePath = path.join(__dirname, "services.xlsx");

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  let currentMain = null;
  let currentSection = null;

  for (const row of rows) {
    // ==============================
    // MAIN SERVICE
    // ==============================
    if (row["Main Service"]) {
      const mainSlug = slugify(row["Main Service"]);

      currentMain = await prisma.mainService.upsert({
        where: { slug: mainSlug },
        update: {},
        create: {
          name: row["Main Service"],
          slug: mainSlug,
        },
      });

      console.log(`✅ Main Service: ${currentMain.name}`);
    }

    if (!currentMain) {
      console.warn("⚠ Skipping row — no Main Service defined yet.");
      continue;
    }

    // ==============================
    // SECTION
    // ==============================
    if (row["Section"]) {
      currentSection = await prisma.serviceSection.create({
        data: {
          name: row["Section"],
          mainServiceId: currentMain.id,
        },
      });

      console.log(`   ↳ Section: ${currentSection.name}`);
    }

    if (!currentSection) {
      console.warn("⚠ Skipping row — no Section defined yet.");
      continue;
    }

    // ==============================
    // SUB SERVICE
    // ==============================
    if (row["Sub Service"]) {
      const service = await prisma.service.create({
        data: {
          name: row["Sub Service"],
          price: Number(row["Price"]) || 0,
          originalPrice: row["Original Price"]
            ? Number(row["Original Price"])
            : null,
          sectionId: currentSection.id,
        },
      });

      console.log(`      ↳ Service: ${service.name}`);
    }
  }

  console.log("🎉 All services inserted successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
