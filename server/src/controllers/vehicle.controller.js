import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import {
  vehicleListingSchema,
  vehicleListingUpdateSchema,
  cleanForPrisma,
} from "../validations/vehicleListing.validator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const carsPath = path.join(__dirname, "../data/cars-data.json");
const bikesPath = path.join(__dirname, "../data/bikes-data.json");

import cloudinaryService from "../config/CloudinaryService.js";

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
          name: b.brand || b.name || b.make || b.manufacturer || "",

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
          logoUrl: b.logo || b.logoUrl || b.image || b.icon || null,
        }));

    console.log("👉 NORMALIZED JSON:", jsonBrands.slice(0, 3));

    // ✅ Merge DB + JSON
    const merged = brands.map((brand) => {
      const match = jsonBrands.find((b) =>
        b.name.toLowerCase().includes(brand.name.toLowerCase()),
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
    const { type = "car" } = req.query; // ✅ read vehicle type (car | bike)

    // 1. DB models with their ModelYear thumbnails
    const models = await prisma.model.findMany({
      where: { brandId: String(brandId) },
      include: { modelYear: true },
    });

    // 2. Load JSON for the correct vehicle type
    let jsonModels = []; // flat list: [{ name, thumbnailUrl }]
    try {
      const jsonData = getData(type); // reads cars-data.json or bikes-data.json

      // Find the matching brand entry in JSON by looking up the brand name from DB
      // We need the brand name — fetch it once
      const brand = await prisma.brand.findUnique({
        where: { id: String(brandId) },
        select: { name: true },
      });

      if (brand) {
        const jsonBrand = jsonData.find((b) => {
          const jsonName = (b.make || b.name || b.brand || "").toLowerCase();
          return (
            jsonName.includes(brand.name.toLowerCase()) ||
            brand.name.toLowerCase().includes(jsonName)
          );
        });

        if (jsonBrand?.models) {
          jsonModels = jsonBrand.models.map((m) => ({
            name: m.name || "",
            thumbnailUrl: m.thumbnailUrl || m.heroUrl || null,
          }));
        }
      }
    } catch (err) {
      console.error("❌ JSON read error in getModels:", err);
    }

    // 3. Merge: DB is source of truth for id/name; JSON fills in thumbnailUrl
    const formatted = models.map((m) => {
      // DB thumbnail: pick from ModelYear rows
      const sortedYears = [...(m.ModelYear || [])].sort(
        (a, b) => b.year - a.year,
      );
      const dbThumb =
        sortedYears.find((y) => y.thumbnailUrl && y.thumbnailUrl !== "")
          ?.thumbnailUrl || null;

      // JSON thumbnail: fuzzy-match by name
      const jsonMatch = jsonModels.find(
        (j) =>
          j.name.toLowerCase().includes(m.name.toLowerCase()) ||
          m.name.toLowerCase().includes(j.name.toLowerCase()),
      );
      const jsonThumb = jsonMatch?.thumbnailUrl || null;

      return {
        id: m.id,
        name: m.name,
        thumbnailUrl: dbThumb || jsonThumb || null, // DB wins, JSON is fallback
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("❌ getModels error:", error);
    res.status(500).json({ message: "Failed to fetch models" });
  }
};

// MY=============Vehicle CRUD operations (create, read, update, delete).================

// export const createVehicle = async (req, res, next) => {
//   try {
//     console.log("createVehicle: user=", req.user?.id || null);
//     console.log(
//       "createVehicle: body keys=",
//       Object.keys(req.body || {}).join(", ") || "(none)",
//     );
//     console.log(
//       "createVehicle: files=",
//       Object.keys(req.files || {})
//         .map((k) => `${k}(${(req.files[k] || []).length})`)
//         .join(", ") || "(none)",
//     );

//     const {
//       title,
//       category,
//       brand,
//       model,
//       variant,
//       registrationNumber,
//       vin,
//       price,
//       negotiable,
//       emiAvailable,
//       manufacturingYear,
//       registrationYear,
//       fuelType,
//       transmission,
//       kmDriven,
//       ownership,
//       color,
//       seatingCapacity,
//       engineCapacity,
//       mileage,
//       rcAvailable,
//       insuranceAvailable,
//       insuranceExpiry,
//       pollutionCertificate,
//       serviceBook,
//       numberOfKeys,
//       loanPending,
//       nocAvailable,
//       vehicleCondition,
//       accidentHistory,
//       floodDamage,
//       engineCondition,
//       tyreCondition,
//       batteryCondition,
//       features,
//       sellerName,
//       mobileNumber,
//       email,
//       sellerType,
//       dealerName,
//       country,
//       state,
//       city,
//       area,
//       pincode,
//       description,
//     } = req.body;

//     if (!title || !brand || !model || !price || !fuelType || !transmission) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Missing required fields (title, brand, model, price, fuelType, transmission)",
//       });
//     }

//     if (!req.user?.id) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Authentication required" });
//     }

//     // ---- Upload gallery images (multiple) ----
//     const imageFiles = req.files?.images || [];
//     const imageUrls = [];
//     for (const file of imageFiles) {
//       const result = await cloudinaryService.uploadBuffer(
//         file.buffer,
//         "vehiclehub/vehicles",
//       );
//       imageUrls.push(result.secure_url);
//     }

//     // ---- Upload single documents ----
//     const rcFrontFile = req.files?.rcFront?.[0];
//     const insuranceDocFile = req.files?.insuranceDocument?.[0];

//     const rcFrontUrl = rcFrontFile
//       ? (
//           await cloudinaryService.uploadBuffer(
//             rcFrontFile.buffer,
//             "vehiclehub/documents",
//           )
//         ).secure_url
//       : undefined;

//     const insuranceDocumentUrl = insuranceDocFile
//       ? (
//           await cloudinaryService.uploadBuffer(
//             insuranceDocFile.buffer,
//             "vehiclehub/documents",
//           )
//         ).secure_url
//       : undefined;

//     // features can arrive as multiple form fields with same name -> array, or a single string
//     const featuresArray = Array.isArray(features)
//       ? features
//       : features
//         ? [features]
//         : [];

//     const payload = {
//       sellerId: req.user.id,

//       title,
//       category,
//       brand,
//       model,
//       variant: variant || null,
//       registrationNumber: registrationNumber || null,
//       vin: vin || null,

//       price: price !== undefined ? Number(price) : undefined,
//       negotiable:
//         negotiable === "Yes" || negotiable === "true" || negotiable === true,
//       emiAvailable:
//         emiAvailable === "Yes" ||
//         emiAvailable === "true" ||
//         emiAvailable === true,

//       manufacturingYear: manufacturingYear ? Number(manufacturingYear) : null,
//       registrationYear: registrationYear ? Number(registrationYear) : null,
//       fuelType,
//       transmission,
//       kmDriven: kmDriven ? Number(kmDriven) : null,
//       ownership: ownership || null,
//       color: color || null,
//       seatingCapacity: seatingCapacity ? Number(seatingCapacity) : null,
//       engineCapacity: engineCapacity ? Number(engineCapacity) : null,
//       mileage: mileage ? Number(mileage) : null,

//       rcAvailable:
//         rcAvailable !== "No" &&
//         rcAvailable !== "false" &&
//         rcAvailable !== false,
//       insuranceAvailable:
//         insuranceAvailable !== "No" &&
//         insuranceAvailable !== "false" &&
//         insuranceAvailable !== false,
//       insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
//       pollutionCertificate:
//         pollutionCertificate !== "No" &&
//         pollutionCertificate !== "false" &&
//         pollutionCertificate !== false,
//       serviceBook:
//         serviceBook !== "No" &&
//         serviceBook !== "false" &&
//         serviceBook !== false,
//       numberOfKeys: numberOfKeys ? Number(numberOfKeys) : 2,
//       loanPending:
//         loanPending === "Yes" || loanPending === "true" || loanPending === true,
//       nocAvailable:
//         nocAvailable !== "No" &&
//         nocAvailable !== "false" &&
//         nocAvailable !== false,

//       vehicleCondition: vehicleCondition || null,
//       accidentHistory:
//         accidentHistory === "Yes" ||
//         accidentHistory === "true" ||
//         accidentHistory === true,
//       floodDamage:
//         floodDamage === "Yes" || floodDamage === "true" || floodDamage === true,
//       engineCondition: engineCondition || "Good",
//       tyreCondition: tyreCondition || "Good",
//       batteryCondition: batteryCondition || "Good",

//       features: featuresArray,

//       sellerName: sellerName || null,
//       mobileNumber: mobileNumber || null,
//       email: email || null,
//       sellerType: sellerType || "Individual",
//       dealerName: dealerName || null,

//       country: country || "India",
//       state: state || null,
//       city: city || null,
//       area: area || null,
//       pincode: pincode || null,

//       images: imageUrls,
//       rcFront: rcFrontUrl || null,
//       insuranceDocument: insuranceDocumentUrl || null,
//       documents: [rcFrontUrl, insuranceDocumentUrl].filter(Boolean),

//       description: description || null,

//       status: "PENDING",
//       isFeatured: false,
//     };

//     Object.keys(payload).forEach(
//       (k) => payload[k] === undefined && delete payload[k],
//     );

//     const vehicle = await prisma.vehicleListing.create({ data: payload });

//     return res.status(201).json({
//       success: true,
//       message:
//         "Vehicle listed successfully. It will be reviewed before going live.",
//       vehicle,
//     });
//   } catch (error) {
//     console.error("createVehicle error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create vehicle listing",
//       error: error.message,
//     });
//   }
// };

// export const updateVehicle = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const body = { ...req.body };

//     if (req.files?.images?.length) {
//       const newUrls = [];
//       for (const file of req.files.images) {
//         const result = await cloudinaryService.uploadBuffer(
//           file.buffer,
//           "vehiclehub/vehicles",
//         );
//         newUrls.push(result.secure_url);
//       }
//       const existing = await prisma.vehicleListing.findUnique({
//         where: { id },
//       });
//       body.images = [...(existing?.images || []), ...newUrls];
//     }

//     if (req.files?.rcFront?.[0]) {
//       const result = await cloudinaryService.uploadBuffer(
//         req.files.rcFront[0].buffer,
//         "vehiclehub/documents",
//       );
//       body.rcFront = result.secure_url;
//     }
//     if (req.files?.insuranceDocument?.[0]) {
//       const result = await cloudinaryService.uploadBuffer(
//         req.files.insuranceDocument[0].buffer,
//         "vehiclehub/documents",
//       );
//       body.insuranceDocument = result.secure_url;
//     }

//     [
//       "price",
//       "manufacturingYear",
//       "registrationYear",
//       "kmDriven",
//       "seatingCapacity",
//       "engineCapacity",
//       "mileage",
//       "numberOfKeys",
//     ].forEach((k) => {
//       if (body[k] !== undefined) body[k] = Number(body[k]);
//     });

//     const vehicle = await prisma.vehicleListing.update({
//       where: { id },
//       data: body,
//     });
//     return res.json({
//       success: true,
//       message: "Vehicle updated successfully",
//       vehicle,
//     });
//   } catch (error) {
//     console.error("updateVehicle error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to update vehicle" });
//   }
// };

export const createVehicle = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    // ---- Validate & coerce request body ----
    const parsed = vehicleListingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed. Please check the highlighted fields.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const data = cleanForPrisma(parsed.data);

    // ---- File validation ----
    const imageFiles = req.files?.images || [];
    if (imageFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one vehicle image is required.",
      });
    }
    if (imageFiles.length > 15) {
      return res.status(400).json({
        success: false,
        message: "You can upload at most 15 images.",
      });
    }

    // ---- Upload gallery images ----
    const imageUrls = [];
    for (const file of imageFiles) {
      const result = await cloudinaryService.uploadBuffer(
        file.buffer,
        "vehiclehub/vehicles",
      );
      imageUrls.push(result.secure_url);
    }

    // ---- Upload single documents ----
    const rcFrontFile = req.files?.rcFront?.[0];
    const insuranceDocFile = req.files?.insuranceDocument?.[0];

    const rcFrontUrl = rcFrontFile
      ? (
          await cloudinaryService.uploadBuffer(
            rcFrontFile.buffer,
            "vehiclehub/documents",
          )
        ).secure_url
      : null;

    const insuranceDocumentUrl = insuranceDocFile
      ? (
          await cloudinaryService.uploadBuffer(
            insuranceDocFile.buffer,
            "vehiclehub/documents",
          )
        ).secure_url
      : null;

    const payload = {
      ...data,
      sellerId: req.user.id,
      images: imageUrls,
      rcFront: rcFrontUrl,
      insuranceDocument: insuranceDocumentUrl,
      documents: [rcFrontUrl, insuranceDocumentUrl].filter(Boolean),
      status: "UNDER_VERIFICATION",
      isFeatured: false,
    };

    const vehicle = await prisma.vehicleListing.create({ data: payload });

    await prisma.sellerNotification.create({
      data: {
        userId: vehicle.sellerId,
        title: "Vehicle under verification",
        message: `Your listing "${vehicle.title}" was submitted and is being reviewed by admin.`,
        type: "VEHICLE_UNDER_VERIFICATION",
        link: "/seller/dashboard/pending-approval",
      },
    });

    return res.status(201).json({
      success: true,
      message:
        "Vehicle listed successfully. It will be reviewed before going live.",
      vehicle,
    });
  } catch (error) {
    console.error("createVehicle error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle listing",
    });
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingVehicle = await prisma.vehicleListing.findUnique({
      where: { id },
    });
    if (!existingVehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    if (
      req.user?.role === "SELLER" &&
      existingVehicle.sellerId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own listings",
      });
    }

    const parsed = vehicleListingUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed. Please check the highlighted fields.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const data = cleanForPrisma(parsed.data);

    // Frontend sends "existingImages" (JSON array of URLs kept after the seller
    // deleted some from the gallery) — it isn't part of the zod schema so read it raw.
    let keptImages;
    if (req.body.existingImages !== undefined) {
      try {
        keptImages = JSON.parse(req.body.existingImages);
        if (!Array.isArray(keptImages)) keptImages = [];
      } catch {
        keptImages = [];
      }
    }

    if (req.files?.images?.length) {
      if (req.files.images.length > 15) {
        return res.status(400).json({
          success: false,
          message: "You can upload at most 15 images.",
        });
      }
      const newUrls = [];
      for (const file of req.files.images) {
        const result = await cloudinaryService.uploadBuffer(
          file.buffer,
          "vehiclehub/vehicles",
        );
        newUrls.push(result.secure_url);
      }
      data.images = [
        ...(keptImages !== undefined
          ? keptImages
          : existingVehicle.images || []),
        ...newUrls,
      ];
    } else if (keptImages !== undefined) {
      data.images = keptImages;
    }

    if (req.files?.rcFront?.[0]) {
      const result = await cloudinaryService.uploadBuffer(
        req.files.rcFront[0].buffer,
        "vehiclehub/documents",
      );
      data.rcFront = result.secure_url;
    } else if (req.body.removeRcFront === "true") {
      data.rcFront = null;
    }
    if (req.files?.insuranceDocument?.[0]) {
      const result = await cloudinaryService.uploadBuffer(
        req.files.insuranceDocument[0].buffer,
        "vehiclehub/documents",
      );
      data.insuranceDocument = result.secure_url;
    } else if (req.body.removeInsuranceDocument === "true") {
      data.insuranceDocument = null;
    }

    // Generic extra documents: "existingDocuments" (JSON array of kept URLs) + new "documents" files
    let keptDocuments;
    if (req.body.existingDocuments !== undefined) {
      try {
        keptDocuments = JSON.parse(req.body.existingDocuments);
        if (!Array.isArray(keptDocuments)) keptDocuments = [];
      } catch {
        keptDocuments = [];
      }
    }
    if (req.files?.documents?.length) {
      const newDocUrls = [];
      for (const file of req.files.documents) {
        const result = await cloudinaryService.uploadBuffer(
          file.buffer,
          "vehiclehub/documents",
        );
        newDocUrls.push(result.secure_url);
      }
      data.documents = [
        ...(keptDocuments !== undefined
          ? keptDocuments
          : existingVehicle.documents || []),
        ...newDocUrls,
      ];
    } else if (keptDocuments !== undefined) {
      data.documents = keptDocuments;
    }

    const vehicle = await prisma.vehicleListing.update({ where: { id }, data });
    return res.json({
      success: true,
      message: "Vehicle updated successfully",
      vehicle,
    });
  } catch (error) {
    console.error("updateVehicle error:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Failed to update vehicle" });
  }
};

export const deleteVehicleImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res
        .status(400)
        .json({ success: false, message: "imageUrl is required" });
    }

    const existingVehicle = await prisma.vehicleListing.findUnique({
      where: { id },
    });
    if (!existingVehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    if (
      req.user?.role === "SELLER" &&
      existingVehicle.sellerId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own listings",
      });
    }

    const updatedImages = (existingVehicle.images || []).filter(
      (img) => img !== imageUrl,
    );
    const vehicle = await prisma.vehicleListing.update({
      where: { id },
      data: { images: updatedImages },
    });

    return res.json({
      success: true,
      message: "Image deleted successfully",
      vehicle,
    });
  } catch (error) {
    console.error("deleteVehicleImage error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete image" });
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    await prisma.vehicleListing.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("deleteVehicle error:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to delete vehicle" });
  }
};

export const getAllVehicles = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      fuelType,
      city,
      isFeatured,
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (category) where.category = category;
    if (fuelType) where.fuelType = fuelType;
    if (city) where.city = city;
    if (isFeatured !== undefined)
      where.isFeatured = isFeatured === "true" || isFeatured === true;
    where.status = "APPROVED";

    const [vehicles, total] = await Promise.all([
      prisma.vehicleListing.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.vehicleListing.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Vehicles fetched successfully",
      data: { vehicles, total, page: Number(page), limit: Number(limit) },
    });
  } catch (error) {
    console.error("getAllVehicles error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch vehicles" });
  }
};

export const getPendingVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicleListing.findMany({
      where: { status: "UNDER_VERIFICATION" },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: { vehicles, total: vehicles.length } });
  } catch (error) {
    console.error("getPendingVehicles error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch pending vehicles" });
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicleListing.findUnique({
      where: { id: req.params.id },
    });
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    res.json({
      success: true,
      message: "Vehicle fetched successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("getVehicleById error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch vehicle" });
  }
};

export const getFeaturedVehicles = async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicleListing.findMany({
      where: { isFeatured: true, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      success: true,
      message: "Featured vehicles fetched successfully",
      data: vehicles,
    });
  } catch (error) {
    console.error("getFeaturedVehicles error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch featured vehicles" });
  }
};

export const searchVehicle = async (req, res, next) => {
  try {
    const { q } = req.query;
    const vehicles = await prisma.vehicleListing.findMany({
      where: {
        status: "APPROVED",
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { brand: { contains: q, mode: "insensitive" } },
                { model: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      success: true,
      message: "Search results fetched successfully",
      data: vehicles,
    });
  } catch (error) {
    console.error("searchVehicle error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

export const filterVehicle = async (req, res, next) => {
  try {
    const { category, fuelType, minPrice, maxPrice, city } = req.query;
    const where = { status: "APPROVED" };
    if (category) where.category = category;
    if (fuelType) where.fuelType = fuelType;
    if (city) where.city = city;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const vehicles = await prisma.vehicleListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json({
      success: true,
      message: "Filtered vehicles fetched successfully",
      data: vehicles,
    });
  } catch (error) {
    console.error("filterVehicle error:", error);
    res.status(500).json({ success: false, message: "Filter failed" });
  }
};

export const approveVehicle = async (req, res, next) => {
  try {
    const vehicle = await prisma.$transaction(async (tx) => {
      const updated = await tx.vehicleListing.update({
        where: { id: req.params.id },
        data: { status: "APPROVED", rejectReason: null },
      });
      await tx.sellerNotification.create({
        data: {
          userId: updated.sellerId,
          title: "Vehicle approved",
          message: `Your listing "${updated.title}" is now live for buyers.`,
          type: "VEHICLE_APPROVED",
          link: "/seller/dashboard/active-listings",
        },
      });
      return updated;
    });

    res.json({ success: true, message: "Vehicle approved", data: vehicle });
  } catch (error) {
    console.error("approveVehicle error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to approve vehicle" });
  }
};

export const rejectVehicle = async (req, res, next) => {
  try {
    const reason = String(req.body?.reason || "").trim();
    if (!reason)
      return res
        .status(400)
        .json({ success: false, message: "Rejection reason is required" });
    const vehicle = await prisma.$transaction(async (tx) => {
      const updated = await tx.vehicleListing.update({
        where: { id: req.params.id },
        data: { status: "REJECTED", rejectReason: reason },
      });
      await tx.sellerNotification.create({
        data: {
          userId: updated.sellerId,
          title: "Vehicle rejected",
          message: `Your listing "${updated.title}" was rejected. Reason: ${reason}`,
          type: "VEHICLE_REJECTED",
          link: "/seller/dashboard/rejected",
        },
      });
      return updated;
    });
    res.json({ success: true, message: "Vehicle rejected", data: vehicle });
  } catch (error) {
    console.error("rejectVehicle error:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to reject vehicle" });
  }
};

export const soldVehicle = async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicleListing.update({
      where: { id: req.params.id },
      data: { status: "SOLD" },
    });
    res.json({ success: true, message: "Vehicle marked sold", data: vehicle });
  } catch (error) {
    console.error("soldVehicle error:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    res.status(500).json({ success: false, message: "Failed to mark sold" });
  }
};

export const pendingVehicle = async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicleListing.update({
      where: { id: req.params.id },
      data: { status: "UNDER_VERIFICATION" },
    });
    res.json({
      success: true,
      message: "Vehicle submitted for verification",
      data: vehicle,
    });
  } catch (error) {
    console.error("pendingVehicle error:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    res.status(500).json({ success: false, message: "Failed to mark pending" });
  }
};

// in Public/Homepage Showcase Approved Vehicles
export const getHomepageVehicles = async (req, res) => {
  try {
    const [byCategory, electric, latest] = await Promise.all([
      prisma.vehicleListing.groupBy({
        by: ["category"],
        where: { status: "APPROVED" },
        _count: true,
      }),
      prisma.vehicleListing.findMany({
        where: { status: "APPROVED", fuelType: "Electric" },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      prisma.vehicleListing.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
    ]);

    const categories = byCategory.map((c) => c.category).filter(Boolean);

    const byCategoryVehicles = {};
    for (const cat of categories) {
      byCategoryVehicles[cat] = await prisma.vehicleListing.findMany({
        where: { status: "APPROVED", category: cat },
        orderBy: { createdAt: "desc" },
        take: 12,
      });
    }

    res.json({
      success: true,
      message: "Homepage vehicles fetched",
      data: { categories, byCategory: byCategoryVehicles, electric, latest },
    });
  } catch (error) {
    console.error("getHomepageVehicles error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load homepage vehicles" });
  }
};
