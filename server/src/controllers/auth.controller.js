// auth.controller.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const carsPath = path.join(__dirname, "../data/cars-data.json");
const bikesPath = path.join(__dirname, "../data/bikes-data.json");

// ─────────────────────────────────────────────
// GET /me  — full profile with address + vehicles
// ─────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        vehicles: {
          include: {
            brand: true,
            model: true,
            vehicleType: true,
            modelYear: true,
          },
        },
        address: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const { address, ...rest } = user;

    res.json({
      success: true,
      data: {
        ...rest,
        address: address ?? {},
      },
    });
  } catch (err) {
    next(err);
  }
};
export const getProfileImage = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.profileImage) {
      return res.status(404).send("No image found");
    }

    res.set("Content-Type", user.profileImageType); // ✅ VERY IMPORTANT
    res.send(user.profileImage); // ✅ send binary
  } catch (err) {
    res.status(500).send("Error fetching image");
  }
};
// ─────────────────────────────────────────────
// PUT /me  — update all editable profile fields
// Body: { name, email, dob, company, taxNumber, registrationNumber, address: { street, city, state, postalCode, country } }
// ─────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, dob, company, taxNumber, address } = req.body;

    // Build user update payload (only include defined fields)
    const userUpdateData = {};
    if (name !== undefined) userUpdateData.name = name;
    if (email !== undefined) userUpdateData.email = email;
    if (dob !== undefined) userUpdateData.dob = dob;
    if (company !== undefined) userUpdateData.company = company;
    if (taxNumber !== undefined) userUpdateData.taxNumber = taxNumber;

    // Upsert address if provided
    if (address) {
      const { street, city, state, postalCode, country } = address;

      await prisma.userAddress.upsert({
        where: { userId: req.user.id },
        update: { street, city, state, postalCode, country },
        create: {
          userId: req.user.id,
          street,
          city,
          state,
          postalCode,
          country,
        },
      });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: userUpdateData,
      include: {
        vehicles: true,
        address: true,
      },
    });

    const { address: addr, ...rest } = updated;
    res.json({
      success: true,
      data: {
        ...rest,
        address: addr ?? {},
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /vehicles  — add a vehicle
// ─────────────────────────────────────────────
// export const addVehicle = async (req, res, next) => {
//   try {
//     const {
//       vehicleType = "car",
//       brandSlug,
//       modelSlug,
//       fuelType,
//       registration,
//     } = req.body;

//     // 1. Find vehicle type
//     const type = await prisma.vehicleType.findFirst({
//       where: {
//         name: {
//           equals: vehicleType,
//           mode: "insensitive",
//         },
//       },
//     });

//     if (!type) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid vehicle type" });
//     }

//     // 2. Find brand
//     const brand = await prisma.brand.findFirst({
//       where: {
//         name: {
//           equals: brandSlug,
//           mode: "insensitive",
//         },
//       },
//     });

//     if (!brand) {
//       return res.status(400).json({ success: false, message: "Invalid brand" });
//     }

//     // 3. Find model
//     const model = await prisma.model.findFirst({
//       where: {
//         brandId: brand.id,
//         name: {
//           equals: modelSlug,
//           mode: "insensitive",
//         },
//       },
//     });

//     if (!model) {
//       return res.status(400).json({ success: false, message: "Invalid model" });
//     }

//     // 4. Create vehicle with relation connections
//     const vehicle = await prisma.vehicle.create({
//       data: {
//         user: {
//           connect: { id: req.user.id },
//         },
//         vehicleType: {
//           connect: { id: type.id },
//         },
//         brand: {
//           connect: { id: brand.id },
//         },
//         model: {
//           connect: { id: model.id },
//         },
//         fuelType: fuelType ?? null,
//         registration: registration ?? null,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       data: vehicle,
//     });
//   } catch (err) {
//     console.error("Vehicle create error:", err);
//     next(err);
//   }
// };
export const addVehicle = async (req, res, next) => {
  try {
    const {
      vehicleType = "car",
      brandName,
      modelName,
      modelYear,       // ✅ year the user typed e.g. "2023"
      fuelType,
      transmission,
      registration,
    } = req.body;

    // 1. Find vehicle type
    const type = await prisma.vehicleType.findFirst({
      where: { name: { equals: vehicleType, mode: "insensitive" } },
    });
    if (!type) return res.status(400).json({ success: false, message: "Invalid vehicle type" });

    // 2. Find brand
    const brand = await prisma.brand.findFirst({
      where: { name: { equals: brandName, mode: "insensitive" } },
    });
    if (!brand) return res.status(400).json({ success: false, message: "Brand not found" });

    // 3. Find model
    const model = await prisma.model.findFirst({
      where: { brandId: brand.id, name: { equals: modelName, mode: "insensitive" } },
    });
    if (!model) return res.status(400).json({ success: false, message: "Model not found" });

    // 4. Create ModelYear if year provided → copy id into Vehicle
    let modelYearId = null;
    if (modelYear) {
      const parsedYear = parseInt(modelYear.toString().match(/\d{4}/)?.[0]);
      if (parsedYear) {
        const createdYear = await prisma.modelYear.create({
          data: {
            modelId: model.id,   // ✅ which model
            year: parsedYear,    // ✅ user entered year
          },
        });
        modelYearId = createdYear.id; // ✅ copy id
      }
    }

    // 5. Create vehicle — paste modelYearId
    const vehicle = await prisma.vehicle.create({
      data: {
        user: { connect: { id: req.user.id } },
        vehicleType: { connect: { id: type.id } },
        brand: { connect: { id: brand.id } },
        model: { connect: { id: model.id } },
        ...(modelYearId ? { modelYear: { connect: { id: modelYearId } } } : {}),
        fuelType: fuelType ?? null,
        registration: registration ?? null,
      },
    });

    return res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    console.error("❌ Vehicle create error:", err);
    next(err);
  }
};

// ─────────────────────────────────────────────
// GET /vehicles  — list user's vehicles
// ─────────────────────────────────────────────

// export const getVehicles = async (req, res, next) => {
//   try {
//     const vehicles = await prisma.vehicle.findMany({
//       where: { userId: req.user.id },
//       include: {
//         brand: true,
//         model: true,
//         vehicleType: true,
//         modelYear: true,
//       },
//     });

//     res.json({ success: true, data: vehicles });
//   } catch (err) {
//     next(err);
//   }
// };
export const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: req.user.id },
      include: {
        brand: true,
        vehicleType: true,
        modelYear: true,
        model: {
          select: {
            id: true,
            name: true,
            segment: true,
            ModelYear: {
              select: {
                thumbnailUrl: true,
                heroUrl: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isPrimary: "desc" },
        { createdAt: "desc" },
      ],
    });

    // Load both JSON files once for thumbnail fallback
    let carsJson = [];
    let bikesJson = [];
    try { carsJson = JSON.parse(fs.readFileSync(carsPath, "utf-8")); } catch (_) {}
    try { bikesJson = JSON.parse(fs.readFileSync(bikesPath, "utf-8")); } catch (_) {}

    const getJsonThumb = (vehicleTypeName, brandName, modelName) => {
      const isBike =
        vehicleTypeName?.toLowerCase().includes("bike") ||
        vehicleTypeName?.toLowerCase().includes("motorcycle");
      const jsonData = isBike ? bikesJson : carsJson;

      const jsonBrand = jsonData.find((b) => {
        const jName = (b.make || b.name || b.brand || "").toLowerCase();
        const dbName = (brandName || "").toLowerCase();
        return jName.includes(dbName) || dbName.includes(jName);
      });

      if (!jsonBrand?.models) return null;

      const jsonModel = jsonBrand.models.find((m) => {
        const jm = (m.name || "").toLowerCase();
        const dm = (modelName || "").toLowerCase();
        return jm.includes(dm) || dm.includes(jm);
      });

      return jsonModel?.thumbnailUrl || jsonModel?.heroUrl || null;
    };

    const enriched = vehicles.map((v) => {
      const allYears = v.model?.ModelYear || [];

      // 1. DB ModelYear thumbnails first
      const dbThumb =
        allYears.find((y) => y.thumbnailUrl)?.thumbnailUrl ||
        allYears.find((y) => y.heroUrl)?.heroUrl ||
        v.modelYear?.thumbnailUrl ||
        v.modelYear?.heroUrl ||
        null;

      // 2. JSON fallback if DB has nothing (covers bikes + unseeded cars)
      const finalThumb =
        dbThumb ||
        getJsonThumb(v.vehicleType?.name, v.brand?.name, v.model?.name) ||
        null;

      return {
        ...v,
        model: {
          id: v.model?.id,
          name: v.model?.name,
          segment: v.model?.segment,
          thumbnailUrl: finalThumb,
        },
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vehicleType, brandName, modelName, modelYear, registration } = req.body;

    // 1. Check ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    // 2. Only update fields that were sent
    const updateData = {};
    if (registration !== undefined) updateData.registration = registration;

    // 3. Resolve relations only if all three provided
    if (vehicleType && brandName && modelName) {
      const type = await prisma.vehicleType.findFirst({
        where: { name: { equals: vehicleType, mode: "insensitive" } },
      });
      const brand = await prisma.brand.findFirst({
        where: { name: { equals: brandName, mode: "insensitive" } },
      });
      const model = await prisma.model.findFirst({
        where: { brandId: brand?.id, name: { equals: modelName, mode: "insensitive" } },
      });

      if (!type || !brand || !model) {
        return res.status(400).json({ message: "Invalid vehicle data" });
      }

      updateData.vehicleTypeId = type.id;
      updateData.brandId = brand.id;
      updateData.modelId = model.id;

      // 4. Create new ModelYear if year provided → copy id
      if (modelYear) {
        const parsedYear = parseInt(modelYear.toString().match(/\d{4}/)?.[0]);
        if (parsedYear) {
          const createdYear = await prisma.modelYear.create({
            data: {
              modelId: model.id,  // ✅ which model
              year: parsedYear,   // ✅ user entered year
            },
          });
          updateData.modelYearId = createdYear.id; // ✅ copy id → paste
        }
      }
    }

    // 5. Update vehicle
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, data: updatedVehicle });
  } catch (err) {
    next(err);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        brand: true,
        model: true,
        vehicleType: true,
        modelYear: true,
      },
    });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

export const addGuestVehicle = async (req, res, next) => {
  try {
    const {
      vehicleType = "car",
      brandName,
      modelName,
      fuelType,
      transmission,
    } = req.body;

    console.log("👉 GUEST VEHICLE:", req.body);

    // 1. Find vehicle type
    const type = await prisma.vehicleType.findFirst({
      where: {
        name: {
          equals: vehicleType,
          mode: "insensitive",
        },
      },
    });

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle type",
      });
    }

    // 2. Find brand
    const brand = await prisma.brand.findFirst({
      where: {
        name: {
          equals: brandName,
          mode: "insensitive",
        },
      },
    });

    if (!brand) {
      return res.status(400).json({
        success: false,
        message: "Brand not found",
      });
    }

    // 3. Find model
    const model = await prisma.model.findFirst({
      where: {
        brandId: brand.id,
        name: {
          equals: modelName,
          mode: "insensitive",
        },
      },
    });

    if (!model) {
      return res.status(400).json({
        success: false,
        message: "Model not found",
      });
    }

    // ✅ NO DB SAVE (guest)
    return res.status(200).json({
      success: true,
      message: "Guest vehicle accepted",
      data: {
        vehicleType: type.name,
        brand: brand.name,
        model: model.name,
        fuelType,
        transmission,
      },
    });
  } catch (err) {
    console.error("❌ Guest vehicle error:", err);
    next(err);
  }
};

export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        profileImage: req.file.buffer, // ✅ binary
        profileImageType: req.file.mimetype, // ✅ type
      },
    });

    res.json({
      success: true,
      message: "Image stored in DB",
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// DELETE /vehicles/:id  — remove a vehicle
// ─────────────────────────────────────────────
export const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ownership check
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    res.json({ success: true, message: "Vehicle removed successfully" });
  } catch (err) {
    next(err);
  }
};


// PATCH /auth/vehicles/:id/primary — set one vehicle as primary
export const setPrimaryVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    // Unset all others first, then set this one
    await prisma.$transaction([
      prisma.vehicle.updateMany({
        where: { userId: req.user.id },
        data: { isPrimary: false },
      }),
      prisma.vehicle.update({
        where: { id },
        data: { isPrimary: true },
      }),
    ]);

    res.json({ success: true, message: "Primary vehicle updated" });
  } catch (err) {
    next(err);
  }
};