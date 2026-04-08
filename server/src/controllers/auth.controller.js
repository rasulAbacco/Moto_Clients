// auth.controller.js
import prisma from "../config/db.js";

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
      fuelType,
      transmission,
      registration,
    } = req.body;

    console.log("👉 REQ BODY:", req.body);

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

    // 2. Find brand (by NAME ✅)
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

    // 3. Find model (by NAME + brandId ✅)
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

    // 4. Create vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        user: {
          connect: { id: req.user.id },
        },
        vehicleType: {
          connect: { id: type.id },
        },
        brand: {
          connect: { id: brand.id },
        },
        model: {
          connect: { id: model.id },
        },
        fuelType: fuelType ?? null,
        registration: registration ?? null,
      },
    });

    return res.status(201).json({
      success: true,
      data: vehicle,
    });
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
        model: true,
        vehicleType: true,
        modelYear: true,
      },
    });

    res.json({ success: true, data: vehicles });
  } catch (err) {
    next(err);
  }
};
// export const updateVehicle = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { vehicleType, brandSlug, modelSlug, modelYear, registration } = req.body;

//     // 1. Find vehicle (ownership check)
//     const vehicle = await prisma.vehicle.findFirst({
//       where: {
//         id,
//         userId: req.user.id,
//       },
//     });

//     if (!vehicle) {
//       return res.status(404).json({ message: "Vehicle not found" });
//     }

//     // 2. Resolve relations
//     const type = await prisma.vehicleType.findFirst({
//       where: { name: { equals: vehicleType, mode: "insensitive" } },
//     });

//     const brand = await prisma.brand.findFirst({
//       where: { name: { equals: brandSlug, mode: "insensitive" } },
//     });

//     const model = await prisma.model.findFirst({
//       where: {
//         name: { equals: modelSlug, mode: "insensitive" },
//         brandId: brand?.id,
//       },
//     });

//     // ✅ Validation
//     if (!type || !brand || !model) {
//       return res.status(400).json({
//         message: "Invalid vehicle data",
//       });
//     }

//    let yearId = null;

// if (modelYear) {
//   const extractedYear = modelYear?.toString().match(/\d{4}/);
//   if (extractedYear) {
//     const parsedYear = parseInt(extractedYear[0]);
//     const upsertedYear = await prisma.modelYear.upsert({
//       where: {
//         modelId_year: { modelId: model.id, year: parsedYear },
//       },
//       update: {},
//       create: { modelId: model.id, year: parsedYear },
//     });
//     yearId = upsertedYear.id;
//   }
// }

//     // 3. Update vehicle
//     const updatedVehicle = await prisma.vehicle.update({
//       where: { id },
//       data: {
//         vehicleTypeId: type.id,
//         brandId: brand.id,
//         modelId: model.id,
//         modelYearId: yearId,
//         registration,
//       },
//     });

//     res.json({
//       success: true,
//       data: updatedVehicle,
//     });
//   } catch (err) {
//     next(err);
//   }
// };
export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { vehicleType, brandName, modelName, modelYear, registration } =
      req.body;

    // 1. Check ownership
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // 2. Resolve relations
    const type = await prisma.vehicleType.findFirst({
      where: {
        name: { equals: vehicleType, mode: "insensitive" },
      },
    });

    const brand = await prisma.brand.findFirst({
      where: {
        name: { equals: brandName, mode: "insensitive" },
      },
    });

    const model = await prisma.model.findFirst({
      where: {
        brandId: brand?.id,
        name: { equals: modelName, mode: "insensitive" },
      },
    });

    if (!type || !brand || !model) {
      return res.status(400).json({
        message: "Invalid vehicle data",
      });
    }

    let yearId = null;

    if (modelYear) {
      const extractedYear = modelYear.toString().match(/\d{4}/);
      if (extractedYear) {
        const parsedYear = parseInt(extractedYear[0]);

        const upsertedYear = await prisma.modelYear.upsert({
          where: {
            modelId_year: {
              modelId: model.id,
              year: parsedYear,
            },
          },
          update: {},
          create: {
            modelId: model.id,
            year: parsedYear,
          },
        });

        yearId = upsertedYear.id;
      }
    }

    // 3. Update
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        vehicleTypeId: type.id,
        brandId: brand.id,
        modelId: model.id,
        modelYearId: yearId,
        registration,
      },
    });

    res.json({
      success: true,
      data: updatedVehicle,
    });
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
