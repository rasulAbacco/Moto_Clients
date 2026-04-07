import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const carsPath = path.join(__dirname, "../data/cars-data.json");
const bikesPath = path.join(__dirname, "../data/bikes-data.json");

const getData = (type = "car") => {
  const filePath = type === "bike" ? bikesPath : carsPath;

  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
};

// GET ALL BRANDS
export const getBrands = async (req, res) => {
  try {
    const { type } = req.query;

    console.log("👉 TYPE:", type);

    // ✅ Get vehicle type
    const vehicleType = await prisma.vehicleType.findFirst({
      where: {
        name: {
          equals: type,
          mode: "insensitive",
        },
      },
    });

    if (!vehicleType) {
      return res.status(400).json({ message: "Invalid vehicle type" });
    }

    // ✅ DB brands
    const brands = await prisma.brand.findMany({
      where: {
        vehicleTypeId: vehicleType.id,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    // ✅ Load JSON
    let jsonData = [];
    try {
      jsonData = getData(type);
    } catch (err) {
      console.error("❌ JSON read error:", err);
      jsonData = [];
    }

    console.log("👉 RAW JSON SAMPLE:", jsonData[0]);

    // ✅ Normalize JSON into simple structure
    const jsonBrands = Array.isArray(jsonData)
      ? jsonData.map((b) => ({
          name:
            b.brand ||
            b.name ||
            b.make ||
            b.manufacturer ||
            "",

          // 🔥 VERY IMPORTANT: pick logo from multiple possible places
          logoUrl:
            b.logo ||
            b.logoUrl ||
            b.image ||
            b.icon ||
            b.models?.[0]?.image || // fallback from model
            b.models?.[0]?.thumbnailUrl ||
            null,
        }))
      : (jsonData?.brands || []).map((b) => ({
          name: b.name || b.brand || "",
          logoUrl:
            b.logo ||
            b.logoUrl ||
            b.image ||
            b.icon ||
            null,
        }));

    console.log("👉 NORMALIZED JSON:", jsonBrands.slice(0, 3));

    // ✅ Merge DB + JSON
    const merged = brands.map((brand) => {
      const match = jsonBrands.find((b) =>
        b.name.toLowerCase().includes(brand.name.toLowerCase())
      );

      return {
        id: brand.id,
        name: brand.name,
        logoUrl: match?.logoUrl || null,
      };
    });

    console.log("👉 FINAL OUTPUT:", merged.slice(0, 5));

    res.json(merged);
  } catch (error) {
    console.error("❌ getBrands ERROR:", error);
    res.status(500).json({ message: "Failed to fetch brands" });
  }
};


// GET MODELS OF A BRAND
export const getModels = async (req, res) => {
  try {
    const { brandId } = req.params;

    console.log("👉 brandId:", brandId);

    const models = await prisma.model.findMany({
      where: { brandId: String(brandId) },
      include: {
        ModelYear: true,
      },
    });

    const formatted = models.map((m) => {
      // ✅ sort ALL years first
      const sortedYears = [...(m.ModelYear || [])].sort(
        (a, b) => b.year - a.year
      );

      // ✅ pick first VALID image
      const withImage = sortedYears.find(
        (y) => y.thumbnailUrl && y.thumbnailUrl !== ""
      );

      return {
        id: m.id,
        name: m.name,
        thumbnailUrl: withImage?.thumbnailUrl || null,
      };
    });

    console.log(
      "👉 sample output:",
      formatted.slice(0, 3)
    );

    res.json(formatted);
  } catch (error) {
    console.error("❌ getModels error:", error);
    res.status(500).json({ message: "Failed to fetch models" });
  }
};