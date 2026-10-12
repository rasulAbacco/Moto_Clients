// import vehicleService from '../services/vehicleService.js';
// import { sendSuccess, sendError  } from '../utils/response.js';
// import { validate  } from '../middleware/validationMiddleware.js';
// import { createVehicleSchema  } from '../validations/vehicleValidation.js';

// export const createVehicle = [
//   validate(createVehicleSchema),
//   async (req, res, next) => {
//     try {
//       const vehicle = await vehicleService.createVehicle({ ...req.body, sellerId: req.user?.id || req.body.sellerId });
//       sendSuccess(res, 'Vehicle created successfully', vehicle, 201);
//     } catch (error) {
//       next(error);
//     }
//   },
// ];

// export const updateVehicle = async (req, res, next) => {
//   try {
//     const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
//     sendSuccess(res, 'Vehicle updated successfully', vehicle);
//   } catch (error) {
//     next(error);
//   }
// };

// export const deleteVehicle = async (req, res, next) => {
//   try {
//     await vehicleService.deleteVehicle(req.params.id);
//     sendSuccess(res, 'Vehicle deleted successfully');
//   } catch (error) {
//     next(error);
//   }
// };

// export const getAllVehicles = async (req, res, next) => {
//   try {
//     const data = await vehicleService.getAllVehicles(req.query);
//     sendSuccess(res, 'Vehicles fetched successfully', data);
//   } catch (error) {
//     next(error);
//   }
// };

// export const getVehicleById = async (req, res, next) => {
//   try {
//     const vehicle = await vehicleService.getVehicleById(req.params.id);
//     if (!vehicle) return sendError(res, 'Vehicle not found', 404);
//     sendSuccess(res, 'Vehicle fetched successfully', vehicle);
//   } catch (error) {
//     next(error);
//   }
// };

// export const getFeaturedVehicles = async (req, res, next) => {
//   try {
//     const vehicles = await vehicleService.getAllVehicles({ ...req.query, isFeatured: true });
//     sendSuccess(res, 'Featured vehicles fetched successfully', vehicles);
//   } catch (error) {
//     next(error);
//   }
// };

// export const searchVehicle = async (req, res, next) => {
//   try {
//     const data = await vehicleService.getAllVehicles(req.query);
//     sendSuccess(res, 'Search results fetched successfully', data);
//   } catch (error) {
//     next(error);
//   }
// };

// export const filterVehicle = async (req, res, next) => {
//   try {
//     const data = await vehicleService.getAllVehicles(req.query);
//     sendSuccess(res, 'Filtered vehicles fetched successfully', data);
//   } catch (error) {
//     next(error);
//   }
// };

// export const uploadImages = async (req, res) => sendSuccess(res, 'Vehicle images upload ready');
// export const approveVehicle = async (req, res) => sendSuccess(res, 'Vehicle approved');
// export const rejectVehicle = async (req, res) => sendSuccess(res, 'Vehicle rejected');
// export const soldVehicle = async (req, res) => sendSuccess(res, 'Vehicle marked sold');
// export const pendingVehicle = async (req, res) => sendSuccess(res, 'Vehicle marked pending');
import vehicleService from "../services/vehicleService.js";
import cloudinaryService from "../services/cloudinaryService.js";
import { sendSuccess, sendError } from "../utils/response.js";
/**
 * CREATE — expects multipart/form-data:
 *   - text fields matching the Vehicle model
 *   - "images"           -> multiple files (multer .array('images'))
 *   - "rcFront"           -> single file (multer .single or another .array with maxCount:1)
 *   - "insuranceDocument" -> single file
 */
export const createVehicle = async (req, res, next) => {
  try {
    // Debug: log incoming request summary to help trace missing fields/files
    try {
      console.log("createVehicle: user=", req.user?.id || null);
      console.log(
        "createVehicle: body keys=",
        Object.keys(req.body || {}).join(", ") || "(none)",
      );
      console.log(
        "createVehicle: files=",
        Object.keys(req.files || {})
          .map((k) => `${k}(${(req.files[k] || []).length})`)
          .join(", ") || "(none)",
      );
    } catch (logErr) {
      console.log("createVehicle: debug log error", logErr);
    }

    const {
      title,
      description,
      brand,
      model,
      variant,
      categoryId,
      brandId,
      price,
      expectedPrice,
      negotiable,
      year,
      registrationYear,
      mileage,
      fuelType,
      transmission,
      bodyType,
      ownership,
      color,
      engineCapacity,
      seatingCapacity,
      registrationNumber,
      registrationState,
      location,
      city,
      state,
      pincode,
      insuranceCompany,
      insuranceExpiry,
      insuranceType,
      fitnessValidTill,
      pollutionValidTill,
      features,
      airbags,
      abs,
      sunroof,
      alloyWheels,
      bluetooth,
      touchscreen,
      reverseCamera,
      parkingSensors,
      powerSteering,
      powerWindows,
      ac,
      cruiseControl,
      keylessEntry,
      isFeatured,
    } = req.body;

    // Basic required-field guard (Joi/Zod schema in validationMiddleware should also cover this)
    if (!title || !brand || !model || !price || !fuelType || !transmission) {
      return sendError(res, "Missing required vehicle fields", 400);
    }

    // ---- Upload gallery images (multiple) ----
    const imageFiles = req.files?.images || [];
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
      : undefined;

    const insuranceDocumentUrl = insuranceDocFile
      ? (
          await cloudinaryService.uploadBuffer(
            insuranceDocFile.buffer,
            "vehiclehub/documents",
          )
        ).secure_url
      : undefined;

    const payload = {
      title,
      description,
      brand,
      model,
      variant,
      category,
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      sellerId: req.user?.id, // set by authenticateUser middleware

      price: price !== undefined ? Number(price) : undefined,
      expectedPrice:
        expectedPrice !== undefined ? Number(expectedPrice) : undefined,
      negotiable:
        negotiable === "Yes" || negotiable === "true" || negotiable === true,
      emiAvailable:
        emiAvailable === "Yes" ||
        emiAvailable === "true" ||
        emiAvailable === true,

      year: year !== undefined ? Number(year) : undefined,
      registrationYear:
        registrationYear !== undefined ? Number(registrationYear) : undefined,
      mileage: mileage !== undefined ? Number(mileage) : undefined,
      fuelType,
      transmission,
      bodyType,
      ownership: ownership !== undefined ? Number(ownership) : undefined,
      color,
      engineCapacity,
      seatingCapacity:
        seatingCapacity !== undefined ? Number(seatingCapacity) : undefined,
      registrationNumber,
      registrationState,
      location,
      city,
      state,
      pincode,

      insuranceCompany,
      insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : undefined,
      insuranceType,
      fitnessValidTill: fitnessValidTill
        ? new Date(fitnessValidTill)
        : undefined,
      pollutionValidTill: pollutionValidTill
        ? new Date(pollutionValidTill)
        : undefined,

      rcFront: rcFrontUrl,
      insuranceDocument: insuranceDocumentUrl,

      images: imageUrls,
      documents: [rcFrontUrl, insuranceDocumentUrl].filter(Boolean),

      features: Array.isArray(features) ? features : features ? [features] : [],

      airbags: airbags !== undefined ? Number(airbags) : undefined,
      abs: abs === "true" || abs === true,
      sunroof: sunroof === "true" || sunroof === true,
      alloyWheels: alloyWheels === "true" || alloyWheels === true,
      bluetooth: bluetooth === "true" || bluetooth === true,
      touchscreen: touchscreen === "true" || touchscreen === true,
      reverseCamera: reverseCamera === "true" || reverseCamera === true,
      parkingSensors: parkingSensors === "true" || parkingSensors === true,
      powerSteering: powerSteering === "true" || powerSteering === true,
      powerWindows: powerWindows === "true" || powerWindows === true,
      ac: ac === "true" || ac === true,
      cruiseControl: cruiseControl === "true" || cruiseControl === true,
      keylessEntry: keylessEntry === "true" || keylessEntry === true,

      isFeatured: isFeatured === "true" || isFeatured === true,
    };

    // Strip undefined keys so Prisma uses schema defaults where nothing was sent
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k],
    );

    const vehicle = await vehicleService.createVehicle(payload);
    sendSuccess(res, "Vehicle created successfully", vehicle, 201);
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };

    // Frontend sends "existingImages" (JSON array of URLs kept after user deletions)
    // when the image gallery was edited; merge that with any newly uploaded files.
    let keptImages;
    if (body.existingImages !== undefined) {
      try {
        keptImages = JSON.parse(body.existingImages);
        if (!Array.isArray(keptImages)) keptImages = [];
      } catch {
        keptImages = [];
      }
      delete body.existingImages;
    }

    // Optional: allow adding more images / replacing documents on update
    if (req.files?.images?.length) {
      const newUrls = [];
      for (const file of req.files.images) {
        const result = await cloudinaryService.uploadBuffer(
          file.buffer,
          "vehiclehub/vehicles",
        );
        newUrls.push(result.secure_url);
      }
      if (keptImages !== undefined) {
        body.images = [...keptImages, ...newUrls];
      } else {
        const existing = await vehicleService.getVehicleById(id);
        body.images = [...(existing?.images || []), ...newUrls];
      }
    } else if (keptImages !== undefined) {
      body.images = keptImages;
    }

    if (req.files?.rcFront?.[0]) {
      const result = await cloudinaryService.uploadBuffer(
        req.files.rcFront[0].buffer,
        "vehiclehub/documents",
      );
      body.rcFront = result.secure_url;
    }
    if (req.files?.insuranceDocument?.[0]) {
      const result = await cloudinaryService.uploadBuffer(
        req.files.insuranceDocument[0].buffer,
        "vehiclehub/documents",
      );
      body.insuranceDocument = result.secure_url;
    }

    // Cast numeric fields if present
    [
      "price",
      "expectedPrice",
      "year",
      "registrationYear",
      "mileage",
      "ownership",
      "seatingCapacity",
      "airbags",
    ].forEach((k) => {
      if (body[k] !== undefined) body[k] = Number(body[k]);
    });

    const vehicle = await vehicleService.updateVehicle(id, body);
    sendSuccess(res, "Vehicle updated successfully", vehicle);
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);
    sendSuccess(res, "Vehicle deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const getAllVehicles = async (req, res, next) => {
  try {
    const data = await vehicleService.getAllVehicles(req.query);
    sendSuccess(res, "Vehicles fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

export const getHomepageVehicles = async (req, res, next) => {
  try {
    const data = await vehicleService.getHomepageVehicles();
    sendSuccess(res, "Homepage vehicles fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) return sendError(res, "Vehicle not found", 404);
    sendSuccess(res, "Vehicle fetched successfully", vehicle);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedVehicles = async (req, res, next) => {
  try {
    const vehicles = await vehicleService.getAllVehicles({
      ...req.query,
      isFeatured: true,
    });
    sendSuccess(res, "Featured vehicles fetched successfully", vehicles);
  } catch (error) {
    next(error);
  }
};

export const searchVehicle = async (req, res, next) => {
  try {
    const data = await vehicleService.getAllVehicles(req.query);
    sendSuccess(res, "Search results fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

export const filterVehicle = async (req, res, next) => {
  try {
    const data = await vehicleService.getAllVehicles(req.query);
    sendSuccess(res, "Filtered vehicles fetched successfully", data);
  } catch (error) {
    next(error);
  }
};

export const approveVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, {
      status: "AVAILABLE",
      isApproved: true,
    });
    sendSuccess(res, "Vehicle approved", vehicle);
  } catch (error) {
    next(error);
  }
};

export const rejectVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, {
      status: "REJECTED",
      isApproved: false,
    });
    sendSuccess(res, "Vehicle rejected", vehicle);
  } catch (error) {
    next(error);
  }
};

export const soldVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, {
      status: "SOLD",
    });
    sendSuccess(res, "Vehicle marked sold", vehicle);
  } catch (error) {
    next(error);
  }
};

export const pendingVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, {
      status: "PENDING",
    });
    sendSuccess(res, "Vehicle marked pending", vehicle);
  } catch (error) {
    next(error);
  }
};
